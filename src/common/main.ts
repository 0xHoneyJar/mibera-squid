import { CHAINS, CONTRACTS } from "../constants";
import { Context } from "./processorFactory";
import { Participation, Refund, PresalePhase, PresaleStats } from "../model";
import * as miberaPresaleAbi from "../abi/miberaPresale";
import { DateTime } from "luxon";
import { StoreWithCache } from "@belopash/typeorm-store";

type Task = () => Promise<void>;

type MappingContext = Context & {
  store: StoreWithCache;
  queue: Task[];
};

export function createMultiChainMain() {
  return async (ctx: Context) => {
    for (const chain of Object.values(CHAINS)) {
      await processChain(ctx, chain);
    }
  };
}

export function createMain(chain: CHAINS) {
  return async (ctx: Context) => {
    await processChain(ctx, chain);
  };
}

async function processChain(ctx: Context, chain: CHAINS) {
  const mctx: MappingContext = {
    ...ctx,
    queue: [],
  };

  // Initialize PresaleStats if it doesn't exist
  await initializePresaleStats(mctx, chain);

  for (let block of ctx.blocks) {
    await processBlock(mctx, block, chain);
  }

  // Execute queued tasks
  for (let task of mctx.queue) {
    await task();
  }
}

async function initializePresaleStats(mctx: MappingContext, chain: CHAINS) {
  const existingStats = await mctx.store.findOne(PresaleStats, {
    where: { id: `presale-stats-${chain}` },
  });

  if (!existingStats) {
    const stats = new PresaleStats({
      id: `presale-stats-${chain}`,
      currentPhase: 1,
      totalParticipants: 0,
      uniqueParticipants: 0,
      totalParticipationAmount: BigInt(0),
      totalRefundAmount: BigInt(0),
    });
    await mctx.store.save(stats);
  }
}

async function processBlock(mctx: MappingContext, block: any, chain: CHAINS) {
  const currentBlockNumber = BigInt(block.header.height);
  const timestamp = BigInt(block.header.timestamp);
  const blockTime = DateTime.fromMillis(Number(block.header.timestamp));

  // Get the MiberaPresale contract address
  const miberaPresaleContract = CONTRACTS.MiberaPresale;

  // Skip if the contract doesn't exist for this chain or if we're before the start block
  if (
    !miberaPresaleContract ||
    miberaPresaleContract.network !== chain ||
    currentBlockNumber < BigInt(miberaPresaleContract.startBlock)
  ) {
    return;
  }

  for (let log of block.logs) {
    // Skip logs that aren't from our contract
    if (
      log.address.toLowerCase() !== miberaPresaleContract.address.toLowerCase()
    ) {
      continue;
    }

    // Handle Participated events
    if (miberaPresaleAbi.events.Participated.is(log)) {
      const { phase, user, amount } =
        miberaPresaleAbi.events.Participated.decode(log);

      // Queue the task to handle participation
      mctx.queue.push(async () => {
        await handleParticipation(
          mctx,
          phase,
          user,
          amount,
          log.index,
          timestamp,
          currentBlockNumber,
          log.transactionHash,
          chain
        );
      });
    }

    // Handle Refunded events
    else if (miberaPresaleAbi.events.Refunded.is(log)) {
      const { phase, user, amount } =
        miberaPresaleAbi.events.Refunded.decode(log);

      // Queue the task to handle refund
      mctx.queue.push(async () => {
        await handleRefund(
          mctx,
          phase,
          user,
          amount,
          log.index,
          timestamp,
          currentBlockNumber,
          log.transactionHash,
          chain
        );
      });
    }
  }
}

async function handleParticipation(
  mctx: MappingContext,
  phase: bigint,
  user: string,
  amount: bigint,
  index: number,
  timestamp: bigint,
  blockNumber: bigint,
  txHash: string,
  chain: CHAINS
) {
  // Create a new Participation entity
  const participation = new Participation({
    id: `${txHash}-${index}`,
    phase: Number(phase),
    user: user.toLowerCase(),
    amount,
    index,
    timestamp,
    blockNumber,
    txHash,
  });

  await mctx.store.save(participation);

  // Update PresalePhase
  await updatePresalePhase(mctx, Number(phase), user, amount, true, chain);

  // Update PresaleStats
  await updatePresaleStats(mctx, user, amount, true, chain);
}

async function handleRefund(
  mctx: MappingContext,
  phase: bigint,
  user: string,
  amount: bigint,
  index: number,
  timestamp: bigint,
  blockNumber: bigint,
  txHash: string,
  chain: CHAINS
) {
  // Create a new Refund entity
  const refund = new Refund({
    id: `${txHash}-${index}`,
    phase: Number(phase),
    user: user.toLowerCase(),
    amount,
    index,
    timestamp,
    blockNumber,
    txHash,
  });

  await mctx.store.save(refund);

  // Update PresalePhase
  await updatePresalePhase(mctx, Number(phase), user, amount, false, chain);

  // Update PresaleStats
  await updatePresaleStats(mctx, user, amount, false, chain);
}

async function updatePresalePhase(
  mctx: MappingContext,
  phase: number,
  user: string,
  amount: bigint,
  isParticipation: boolean,
  chain: CHAINS
) {
  // Get or create the PresalePhase entity
  let presalePhase = await mctx.store.findOne(PresalePhase, {
    where: { id: `phase-${phase}-${chain}` },
  });

  if (!presalePhase) {
    presalePhase = new PresalePhase({
      id: `phase-${phase}-${chain}`,
      phase,
      merkleRoot: "",
      refundRoot: "",
      priceInBERA: BigInt(0),
      participationCount: 0,
      refundCount: 0,
      totalParticipationAmount: BigInt(0),
      totalRefundAmount: BigInt(0),
    });
  }

  // Update the phase data
  if (isParticipation) {
    presalePhase.participationCount += 1;
    presalePhase.totalParticipationAmount =
      presalePhase.totalParticipationAmount + amount;
  } else {
    presalePhase.refundCount += 1;
    presalePhase.totalRefundAmount = presalePhase.totalRefundAmount + amount;
  }

  await mctx.store.save(presalePhase);
}

async function updatePresaleStats(
  mctx: MappingContext,
  user: string,
  amount: bigint,
  isParticipation: boolean,
  chain: CHAINS
) {
  // Get the PresaleStats entity
  const stats = await mctx.store.findOne(PresaleStats, {
    where: { id: `presale-stats-${chain}` },
  });

  if (!stats) {
    return;
  }

  // Update the stats
  if (isParticipation) {
    stats.totalParticipants += 1;
    stats.totalParticipationAmount = stats.totalParticipationAmount + amount;

    // Check if this is a new unique participant
    const existingParticipations = await mctx.store.find(Participation, {
      where: { user: user.toLowerCase() },
      take: 2, // We only need to know if there's more than 1
    });

    if (existingParticipations.length === 1) {
      stats.uniqueParticipants += 1;
    }
  } else {
    stats.totalRefundAmount = stats.totalRefundAmount + amount;
  }

  await mctx.store.save(stats);
}

// Function to update merkle roots and price when they change
export async function updateContractState(
  mctx: MappingContext,
  phase: number,
  merkleRoot: string,
  refundRoot: string,
  priceInBERA: bigint,
  chain: CHAINS
) {
  // Update the PresalePhase entity
  let presalePhase = await mctx.store.findOne(PresalePhase, {
    where: { id: `phase-${phase}-${chain}` },
  });

  if (!presalePhase) {
    presalePhase = new PresalePhase({
      id: `phase-${phase}-${chain}`,
      phase,
      merkleRoot,
      refundRoot,
      priceInBERA,
      participationCount: 0,
      refundCount: 0,
      totalParticipationAmount: BigInt(0),
      totalRefundAmount: BigInt(0),
    });
  } else {
    presalePhase.merkleRoot = merkleRoot;
    presalePhase.refundRoot = refundRoot;
    presalePhase.priceInBERA = priceInBERA;
  }

  await mctx.store.save(presalePhase);
}

// Function to update current phase
export async function updateCurrentPhase(
  mctx: MappingContext,
  currentPhase: number,
  chain: CHAINS
) {
  // Update the PresaleStats entity
  const stats = await mctx.store.findOne(PresaleStats, {
    where: { id: `presale-stats-${chain}` },
  });

  if (stats) {
    stats.currentPhase = currentPhase;
    await mctx.store.save(stats);
  }
}
