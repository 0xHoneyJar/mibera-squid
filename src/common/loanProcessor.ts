import * as treasuryAbi from "../abi/treasury";
import { CHAINS } from "../constants";
import { AvailableToken, DailyRFV, Loan, LoanStatus, User } from "../model";
import { MappingContext } from "./main";

// Track item loan IDs to their associated item IDs for LoanItemSentBack and ItemLoanExpired events
const itemLoanMap = new Map<string, string>();

export async function processLoanReceived(
  log: any,
  mctx: MappingContext,
  entities: any,
  header: any
) {
  const { loanId, ids, amount, expiry } =
    treasuryAbi.events.LoanReceived.decode(log);
  const userAddress = log.transaction?.from?.toLowerCase();
  if (!userAddress) return;

  let user =
    entities.users.get(userAddress) ||
    (await mctx.store.get(User, userAddress));
  if (!user) {
    user = new User({ id: userAddress });
  }
  entities.users.set(userAddress, user);

  const loan = new Loan({
    id: loanId.toString(),
    user,
    amount: BigInt(amount),
    expiry: new Date(Number(expiry) * 1000),
    status: LoanStatus.ACTIVE,
    nftIds: ids.map((id: bigint) => id.toString()),
    createdAt: new Date(header.timestamp),
    updatedAt: new Date(header.timestamp),
  });
  entities.loans.set(loan.id, loan);
}

export async function processBackingLoanExpired(
  log: any,
  mctx: MappingContext,
  entities: any,
  header: any
) {
  const { loanId } = treasuryAbi.events.BackingLoanExpired.decode(log);
  const loanIdStr = loanId.toString();

  let loan = entities.loans.get(loanIdStr);
  if (!loan) {
    loan = await mctx.store.get(Loan, loanIdStr);
    if (!loan) return;
  }

  loan.status = LoanStatus.EXPIRED;
  loan.updatedAt = new Date(header.timestamp);
  entities.loans.set(loan.id, loan);

  // When a backing loan expires, the tokens used as collateral become available in the treasury
  if (loan.nftIds && loan.nftIds.length > 0) {
    const now = new Date(header.timestamp);
    const chainStr =
      loan.user && loan.user.id
        ? loan.user.id.includes("-")
          ? loan.user.id.split("-")[1]
          : ""
        : "";

    for (const tokenId of loan.nftIds) {
      await setTokenAvailability(
        tokenId,
        true,
        mctx,
        entities,
        now,
        chainStr || CHAINS.BERACHAIN
      );
    }
  }
}

export async function processBackingLoanPayedBack(
  log: any,
  mctx: MappingContext,
  entities: any,
  header: any
) {
  const { loanId } = treasuryAbi.events.BackingLoanPayedBack.decode(log);
  const loanIdStr = loanId.toString();

  let loan = entities.loans.get(loanIdStr);
  if (!loan) {
    loan = await mctx.store.get(Loan, loanIdStr);
    if (!loan) return;
  }

  loan.status = LoanStatus.PAID_BACK;
  loan.updatedAt = new Date(header.timestamp);
  entities.loans.set(loan.id, loan);

  // When a loan is paid back, the tokens return to the original owner and are no longer available in the treasury
  if (loan.nftIds && loan.nftIds.length > 0) {
    const now = new Date(header.timestamp);
    const chainStr =
      loan.user && loan.user.id
        ? loan.user.id.includes("-")
          ? loan.user.id.split("-")[1]
          : ""
        : "";

    for (const tokenId of loan.nftIds) {
      await setTokenAvailability(
        tokenId,
        false,
        mctx,
        entities,
        now,
        chainStr || CHAINS.BERACHAIN
      );
    }
  }
}

export async function processRFVChanged(
  log: any,
  mctx: MappingContext,
  entities: any,
  header: any
) {
  const { newRFV } = treasuryAbi.events.RFVChanged.decode(log);
  const timestamp = BigInt(header.timestamp);
  const dayTimestamp = getDayTimestamp(timestamp);

  const rfvId = `${dayTimestamp.toString()}-${timestamp.toString()}`;

  const dailyRFV = new DailyRFV({
    id: rfvId,
    value: BigInt(newRFV),
    timestamp: timestamp,
    day: dayTimestamp,
  });

  entities.dailyRFVs.set(rfvId, dailyRFV);
}

export async function processItemRedeemed(
  log: any,
  mctx: MappingContext,
  entities: any,
  header: any,
  chain: CHAINS
) {
  const { itemId } = treasuryAbi.events.ItemRedeemed.decode(log);
  const tokenId = itemId.toString();
  const now = new Date(header.timestamp);

  // When an item is redeemed, it becomes available in the treasury
  await setTokenAvailability(tokenId, true, mctx, entities, now, chain);
}

export async function processItemPurchased(
  log: any,
  mctx: MappingContext,
  entities: any,
  header: any,
  chain: CHAINS
) {
  const { itemId } = treasuryAbi.events.ItemPurchased.decode(log);
  const tokenId = itemId.toString();
  const now = new Date(header.timestamp);

  // When an item is purchased, it's no longer available in the treasury
  await setTokenAvailability(tokenId, false, mctx, entities, now, chain);
}

export async function processItemLoaned(
  log: any,
  mctx: MappingContext,
  entities: any,
  header: any,
  chain: CHAINS
) {
  const { loanId, itemId, expiry } = treasuryAbi.events.ItemLoaned.decode(log);
  const tokenId = itemId.toString();
  const now = new Date(header.timestamp);

  // Store the mapping from loanId to itemId for later use
  itemLoanMap.set(loanId.toString(), tokenId);

  // When an item is loaned, it's no longer available in the treasury
  await setTokenAvailability(tokenId, false, mctx, entities, now, chain);
}

export async function processLoanItemSentBack(
  log: any,
  mctx: MappingContext,
  entities: any,
  header: any,
  chain: CHAINS
) {
  const { loanId } = treasuryAbi.events.LoanItemSentBack.decode(log);
  const loanIdStr = loanId.toString();

  // Get the item ID from our mapping
  const itemId = itemLoanMap.get(loanIdStr);

  if (itemId) {
    const now = new Date(header.timestamp);
    // When a loaned item is sent back, it becomes available in the treasury again
    await setTokenAvailability(itemId, true, mctx, entities, now, chain);

    // Clean up the mapping
    itemLoanMap.delete(loanIdStr);
  }
}

export async function processItemLoanExpired(
  log: any,
  mctx: MappingContext,
  entities: any,
  header: any,
  chain: CHAINS
) {
  const { loanId } = treasuryAbi.events.ItemLoanExpired.decode(log);
  const loanIdStr = loanId.toString();

  // Get the item ID from our mapping
  const itemId = itemLoanMap.get(loanIdStr);

  if (itemId) {
    const now = new Date(header.timestamp);
    // When an item loan expires, the item is no longer in the treasury
    await setTokenAvailability(itemId, false, mctx, entities, now, chain);

    // Clean up the mapping
    itemLoanMap.delete(loanIdStr);
  }
}

// Helper function to set token availability status
export async function setTokenAvailability(
  tokenId: string,
  isAvailable: boolean,
  mctx: MappingContext,
  entities: any,
  timestamp: Date,
  chain: CHAINS | string
) {
  const chainStr = typeof chain === "string" ? chain : chain;
  const tokenEntityId = `${tokenId}-${chainStr}`;

  let token = entities.availableTokens.get(tokenEntityId);
  if (!token) {
    token = await mctx.store.get(AvailableToken, tokenEntityId);
    if (!token) {
      token = new AvailableToken({
        id: tokenEntityId,
        isAvailable: isAvailable,
        addedAt: timestamp,
        updatedAt: timestamp,
        chain: chainStr,
      });
    } else {
      token.isAvailable = isAvailable;
      token.updatedAt = timestamp;
    }
  } else {
    token.isAvailable = isAvailable;
    token.updatedAt = timestamp;
  }

  entities.availableTokens.set(tokenEntityId, token);
}

function getDayTimestamp(timestamp: bigint): bigint {
  // Convert from milliseconds to seconds if needed
  const secondsTimestamp =
    timestamp > 10000000000n ? timestamp / BigInt(1000) : timestamp;
  return (secondsTimestamp / BigInt(86400)) * BigInt(86400);
}

async function saveEntities(mctx: MappingContext, entities: any) {
  if (entities.users.size > 0) {
    await mctx.store.upsert([...entities.users.values()]);
  }
  if (entities.loans.size > 0) {
    await mctx.store.upsert([...entities.loans.values()]);
  }
  if (entities.dailyRFVs.size > 0) {
    await mctx.store.upsert([...entities.dailyRFVs.values()]);
  }
  if (entities.availableTokens.size > 0) {
    await mctx.store.upsert([...entities.availableTokens.values()]);
  }
}
