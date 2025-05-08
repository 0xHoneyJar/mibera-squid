import * as treasuryAbi from "../abi/treasury";
import { CHAINS } from "../constants";
import { AvailableToken, DailyRFV, Loan, LoanStatus, User } from "../model";
import { MappingContext } from "./main";

// Track item loan IDs to their associated item IDs for LoanItemSentBack and ItemLoanExpired events
const itemLoanMap = new Map<string, string>();

export async function processLoanReceived(
  log: any,
  ctx: MappingContext,
  header: any
) {
  const { loanId, ids, amount, expiry } =
    treasuryAbi.events.LoanReceived.decode(log);
  const userAddress = log.transaction?.from?.toLowerCase();
  if (!userAddress) return;

  const userDeferred = ctx.store.defer(User, userAddress);

  ctx.queue.add(async () => {
    const user = await userDeferred.getOrInsert(
      () => new User({ id: userAddress })
    );
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
    await ctx.store.upsert(loan);
  });
}

export async function processBackingLoanExpired(
  log: any,
  ctx: MappingContext,
  header: any
) {
  const { loanId } = treasuryAbi.events.BackingLoanExpired.decode(log);
  const loanIdStr = loanId.toString();
  const loanDeferred = ctx.store.defer(Loan, loanIdStr);

  ctx.queue.add(async () => {
    const loan = await loanDeferred.get();
    if (!loan) return;
    loan.status = LoanStatus.EXPIRED;
    loan.updatedAt = new Date(header.timestamp);
    await ctx.store.upsert(loan);
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
          ctx,
          now,
          chainStr || CHAINS.BERACHAIN
        );
      }
    }
  });
}

export async function processBackingLoanPayedBack(
  log: any,
  ctx: MappingContext,
  header: any
) {
  const { loanId } = treasuryAbi.events.BackingLoanPayedBack.decode(log);
  const loanIdStr = loanId.toString();
  const loanDeferred = ctx.store.defer(Loan, loanIdStr);

  ctx.queue.add(async () => {
    const loan = await loanDeferred.get();
    if (!loan) return;
    loan.status = LoanStatus.PAID_BACK;
    loan.updatedAt = new Date(header.timestamp);
    await ctx.store.upsert(loan);
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
          ctx,
          now,
          chainStr || CHAINS.BERACHAIN
        );
      }
    }
  });
}

export async function processRFVChanged(
  log: any,
  ctx: MappingContext,
  header: any
) {
  const { newRFV } = treasuryAbi.events.RFVChanged.decode(log);
  const timestamp = BigInt(header.timestamp);
  const dayTimestamp = getDayTimestamp(timestamp);
  const rfvId = `${dayTimestamp.toString()}-${timestamp.toString()}`;

  ctx.queue.add(async () => {
    const dailyRFV = new DailyRFV({
      id: rfvId,
      value: BigInt(newRFV),
      timestamp: timestamp,
      day: dayTimestamp,
    });
    await ctx.store.upsert(dailyRFV);
  });
}

export async function processItemRedeemed(
  log: any,
  ctx: MappingContext,
  header: any,
  chain: CHAINS
) {
  const { itemId } = treasuryAbi.events.ItemRedeemed.decode(log);
  const tokenId = itemId.toString();
  const now = new Date(header.timestamp);
  await setTokenAvailability(tokenId, true, ctx, now, chain);
}

export async function processItemPurchased(
  log: any,
  ctx: MappingContext,
  header: any,
  chain: CHAINS
) {
  const { itemId } = treasuryAbi.events.ItemPurchased.decode(log);
  const tokenId = itemId.toString();
  const now = new Date(header.timestamp);
  await setTokenAvailability(tokenId, false, ctx, now, chain);
}

export async function processItemLoaned(
  log: any,
  ctx: MappingContext,
  header: any,
  chain: CHAINS
) {
  const { loanId, itemId, expiry } = treasuryAbi.events.ItemLoaned.decode(log);
  const tokenId = itemId.toString();
  const now = new Date(header.timestamp);
  itemLoanMap.set(loanId.toString(), tokenId);
  await setTokenAvailability(tokenId, false, ctx, now, chain);
}

export async function processLoanItemSentBack(
  log: any,
  ctx: MappingContext,
  header: any,
  chain: CHAINS
) {
  const { loanId } = treasuryAbi.events.LoanItemSentBack.decode(log);
  const loanIdStr = loanId.toString();
  const itemId = itemLoanMap.get(loanIdStr);
  if (itemId) {
    const now = new Date(header.timestamp);
    await setTokenAvailability(itemId, true, ctx, now, chain);
    itemLoanMap.delete(loanIdStr);
  }
}

export async function processItemLoanExpired(
  log: any,
  ctx: MappingContext,
  header: any,
  chain: CHAINS
) {
  const { loanId } = treasuryAbi.events.ItemLoanExpired.decode(log);
  const loanIdStr = loanId.toString();
  const itemId = itemLoanMap.get(loanIdStr);
  if (itemId) {
    const now = new Date(header.timestamp);
    await setTokenAvailability(itemId, false, ctx, now, chain);
    itemLoanMap.delete(loanIdStr);
  }
}

// Helper function to set token availability status
export async function setTokenAvailability(
  tokenId: string,
  isAvailable: boolean,
  ctx: MappingContext,
  timestamp: Date,
  chain: CHAINS | string
) {
  const chainStr = typeof chain === "string" ? chain : chain;
  const tokenEntityId = `${tokenId}-${chainStr}`;
  const tokenDeferred = ctx.store.defer(AvailableToken, tokenEntityId);
  ctx.queue.add(async () => {
    const token = await tokenDeferred.getOrInsert(
      () =>
        new AvailableToken({
          id: tokenEntityId,
          isAvailable: isAvailable,
          addedAt: timestamp,
          updatedAt: timestamp,
          chain: chainStr,
        })
    );
    token.isAvailable = isAvailable;
    token.updatedAt = timestamp;
    await ctx.store.upsert(token);
  });
}

function getDayTimestamp(timestamp: bigint): bigint {
  // Convert from milliseconds to seconds if needed
  const secondsTimestamp =
    timestamp > 10000000000n ? timestamp / BigInt(1000) : timestamp;
  return (secondsTimestamp / BigInt(86400)) * BigInt(86400);
}
