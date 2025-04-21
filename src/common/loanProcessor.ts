import { DateTime } from "luxon";
import * as treasuryAbi from "../abi/treasury";
import { CHAINS, CONTRACTS, ContractType } from "../constants";
import { DailyRFV, Loan, LoanStatus, User } from "../model";
import { Context } from "./processorFactory";

type Task = () => Promise<void>;

type MappingContext = Context & {
  store: any;
  queue: Task[];
};

export async function processLoanEvents(ctx: Context, chain: CHAINS) {
  const mctx: MappingContext = {
    ...ctx,
    queue: [],
  };

  const entities = {
    users: new Map<string, User>(),
    loans: new Map<string, Loan>(),
    dailyRFVs: new Map<string, DailyRFV>(),
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
} 