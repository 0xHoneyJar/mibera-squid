import { DateTime } from "luxon";
import * as treasuryAbi from "../abi/treasury";
import { CHAINS, CONTRACTS, ContractType } from "../constants";
import { AvailableToken, DailyRFV, Loan, LoanStatus, User } from "../model";
import { Context } from "./processorFactory";

type Task = () => Promise<void>;

type MappingContext = Context & {
  store: any;
  queue: Task[];
};

// Track item loan IDs to their associated item IDs for LoanItemSentBack and ItemLoanExpired events
const itemLoanMap = new Map<string, string>();

export async function processLoanEvents(ctx: Context, chain: CHAINS) {
  const mctx: MappingContext = {
    ...ctx,
    queue: [],
  };

  const entities = {
    users: new Map<string, User>(),
    loans: new Map<string, Loan>(),
    dailyRFVs: new Map<string, DailyRFV>(),
    availableTokens: new Map<string, AvailableToken>(),
  };

  for (let block of ctx.blocks) {
    await processLoanBlock(mctx, block, chain, entities);
  }

  // Save all entities
  await saveEntities(mctx, entities);

  // Execute queued tasks
  for (let task of mctx.queue) {
    await task();
  }
}

async function processLoanBlock(
  mctx: MappingContext,
  block: any,
  chain: CHAINS,
  entities: any
) {
  const currentBlockNumber = BigInt(block.header.height);
  const timestamp = BigInt(block.header.timestamp);
  const treasuryContract = CONTRACTS[ContractType.Treasury];

  // Skip if the contract doesn't exist for this chain or if we're before the start block
  if (
    !treasuryContract ||
    treasuryContract.network !== chain ||
    currentBlockNumber < BigInt(treasuryContract.startBlock)
  ) {
    return;
  }

  for (let log of block.logs) {
    // Skip logs that aren't from our contract
    if (
      log.address.toLowerCase() !== treasuryContract.address.toLowerCase()
    ) {
      continue;
    }

    // Process loan received events
    if (treasuryAbi.events.LoanReceived.topic === log.topics[0]) {
      await processLoanReceived(log, mctx, entities, block.header);
    }
    // Process loan expired events
    else if (treasuryAbi.events.BackingLoanExpired.topic === log.topics[0]) {
      await processBackingLoanExpired(log, mctx, entities, block.header);
    }
    // Process loan payback events
    else if (treasuryAbi.events.BackingLoanPayedBack.topic === log.topics[0]) {
      await processBackingLoanPayedBack(log, mctx, entities, block.header);
    }
    // Process RFV changed events
    else if (treasuryAbi.events.RFVChanged.topic === log.topics[0]) {
      await processRFVChanged(log, mctx, entities, block.header);
    }
    // Process item redeemed events (token comes into treasury)
    else if (treasuryAbi.events.ItemRedeemed.topic === log.topics[0]) {
      await processItemRedeemed(log, mctx, entities, block.header, chain);
    }
    // Process item purchased events (token leaves treasury)
    else if (treasuryAbi.events.ItemPurchased.topic === log.topics[0]) {
      await processItemPurchased(log, mctx, entities, block.header, chain);
    }
    // Process item loaned events (token leaves treasury temporarily)
    else if (treasuryAbi.events.ItemLoaned.topic === log.topics[0]) {
      await processItemLoaned(log, mctx, entities, block.header, chain);
    }
    // Process loan item sent back events (token returns to treasury)
    else if (treasuryAbi.events.LoanItemSentBack.topic === log.topics[0]) {
      await processLoanItemSentBack(log, mctx, entities, block.header, chain);
    }
    // Process item loan expired events (token no longer in treasury)
    else if (treasuryAbi.events.ItemLoanExpired.topic === log.topics[0]) {
      await processItemLoanExpired(log, mctx, entities, block.header, chain);
    }
  }
}

async function processLoanReceived(log: any, mctx: MappingContext, entities: any, header: any) {
  const { loanId, ids, amount, expiry } = treasuryAbi.events.LoanReceived.decode(log);
  const userAddress = log.transaction?.from?.toLowerCase();
  if (!userAddress) return;

  let user = entities.users.get(userAddress) || await mctx.store.get(User, userAddress);
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

async function processBackingLoanExpired(log: any, mctx: MappingContext, entities: any, header: any) {
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
    const chainStr = loan.user && loan.user.id ? 
      (loan.user.id.includes('-') ? loan.user.id.split('-')[1] : '') : '';
    
    for (const tokenId of loan.nftIds) {
      await setTokenAvailability(tokenId, true, mctx, entities, now, chainStr || CHAINS.BERACHAIN);
    }
  }
}

async function processBackingLoanPayedBack(log: any, mctx: MappingContext, entities: any, header: any) {
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
    const chainStr = loan.user && loan.user.id ? 
      (loan.user.id.includes('-') ? loan.user.id.split('-')[1] : '') : '';
    
    for (const tokenId of loan.nftIds) {
      await setTokenAvailability(tokenId, false, mctx, entities, now, chainStr || CHAINS.BERACHAIN);
    }
  }
}

async function processRFVChanged(log: any, mctx: MappingContext, entities: any, header: any) {
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

async function processItemRedeemed(log: any, mctx: MappingContext, entities: any, header: any, chain: CHAINS) {
  const { itemId } = treasuryAbi.events.ItemRedeemed.decode(log);
  const tokenId = itemId.toString();
  const now = new Date(header.timestamp);
  
  // When an item is redeemed, it becomes available in the treasury
  await setTokenAvailability(tokenId, true, mctx, entities, now, chain);
}

async function processItemPurchased(log: any, mctx: MappingContext, entities: any, header: any, chain: CHAINS) {
  const { itemId } = treasuryAbi.events.ItemPurchased.decode(log);
  const tokenId = itemId.toString();
  const now = new Date(header.timestamp);
  
  // When an item is purchased, it's no longer available in the treasury
  await setTokenAvailability(tokenId, false, mctx, entities, now, chain);
}

async function processItemLoaned(log: any, mctx: MappingContext, entities: any, header: any, chain: CHAINS) {
  const { loanId, itemId, expiry } = treasuryAbi.events.ItemLoaned.decode(log);
  const tokenId = itemId.toString();
  const now = new Date(header.timestamp);
  
  // Store the mapping from loanId to itemId for later use
  itemLoanMap.set(loanId.toString(), tokenId);
  
  // When an item is loaned, it's no longer available in the treasury
  await setTokenAvailability(tokenId, false, mctx, entities, now, chain);
}

async function processLoanItemSentBack(log: any, mctx: MappingContext, entities: any, header: any, chain: CHAINS) {
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

async function processItemLoanExpired(log: any, mctx: MappingContext, entities: any, header: any, chain: CHAINS) {
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
async function setTokenAvailability(
  tokenId: string,
  isAvailable: boolean,
  mctx: MappingContext,
  entities: any,
  timestamp: Date,
  chain: CHAINS | string
) {
  const chainStr = typeof chain === 'string' ? chain : chain;
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
  const secondsTimestamp = timestamp > 10000000000n ? timestamp / BigInt(1000) : timestamp;
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