import { Log } from "@subsquid/evm-processor";
import { BlockHeader } from "@subsquid/evm-processor/lib/interfaces/data";
import * as presaleAbi from "../abi/miberaPresale";
import { CHAINS } from "../constants";
import { Participation, PresalePhase, PresaleStats, Refund } from "../model";
import { TaskQueue } from "../utils/queue";
import { Context } from "./processorFactory";

type MappingContext = Context & {
  queue: TaskQueue;
};

export async function processParticipated(
  log: Log,
  ctx: MappingContext,
  header: BlockHeader,
  chain: CHAINS
) {
  const { phase, user, amount } = presaleAbi.events.Participated.decode(log);
  const blockNumber = BigInt(header.height);
  const timestamp = BigInt(header.timestamp);
  const userAddress = user.toLowerCase();

  // Queue participation creation
  ctx.queue.add(async () => {
    const participation = new Participation({
      id: `${log.transaction?.hash || ""}-${userAddress}`,
      phase: Number(phase),
      user: userAddress,
      amount,
      timestamp,
      blockNumber,
      txHash: log.transaction?.hash || "",
    });

    await ctx.store.save(participation);
  });

  // Queue phase stats update
  ctx.queue.add(async () => {
    await updatePresalePhase(ctx, Number(phase), amount, true, chain);
  });

  // Queue global stats update
  ctx.queue.add(async () => {
    await updatePresaleStats(ctx, userAddress, amount, true, chain);
  });
}

export async function processRefunded(
  log: Log,
  ctx: MappingContext,
  header: BlockHeader,
  chain: CHAINS
) {
  const { phase, user, amount } = presaleAbi.events.Refunded.decode(log);
  const blockNumber = BigInt(header.height);
  const timestamp = BigInt(header.timestamp);
  const userAddress = user.toLowerCase();

  // Queue refund creation
  ctx.queue.add(async () => {
    const refund = new Refund({
      id: `${log.transaction?.hash || ""}-${userAddress}`,
      phase: Number(phase),
      user: userAddress,
      amount,
      timestamp,
      blockNumber,
      txHash: log.transaction?.hash || "",
    });

    await ctx.store.save(refund);
  });

  // Queue phase stats update
  ctx.queue.add(async () => {
    await updatePresalePhase(ctx, Number(phase), amount, false, chain);
  });

  // Queue global stats update
  ctx.queue.add(async () => {
    await updatePresaleStats(ctx, userAddress, amount, false, chain);
  });
}

async function updatePresalePhase(
  ctx: MappingContext,
  phase: number,
  amount: bigint,
  isParticipation: boolean,
  chain: CHAINS
) {
  const phaseId = `phase-${phase}-${chain}`;
  let presalePhase = await ctx.store.findOne(PresalePhase, {
    where: { id: phaseId },
  });

  if (!presalePhase) {
    presalePhase = new PresalePhase({
      id: phaseId,
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

  if (isParticipation) {
    presalePhase.participationCount += 1;
    presalePhase.totalParticipationAmount += amount;
  } else {
    presalePhase.refundCount += 1;
    presalePhase.totalRefundAmount += amount;
  }

  await ctx.store.save(presalePhase);
}

async function updatePresaleStats(
  ctx: MappingContext,
  user: string,
  amount: bigint,
  isParticipation: boolean,
  chain: CHAINS
) {
  const statsId = `presale-stats-${chain}`;
  let stats = await ctx.store.findOne(PresaleStats, {
    where: { id: statsId },
  });

  if (!stats) {
    stats = new PresaleStats({
      id: statsId,
      currentPhase: 1,
      totalParticipants: 0,
      uniqueParticipants: 0,
      totalParticipationAmount: BigInt(0),
      totalRefundAmount: BigInt(0),
    });
  }

  if (isParticipation) {
    stats.totalParticipants += 1;
    stats.totalParticipationAmount += amount;

    // Check for unique participant
    const existingParticipations = await ctx.store.find(Participation, {
      where: { user },
      take: 2,
    });

    if (existingParticipations.length === 1) {
      stats.uniqueParticipants += 1;
    }
  } else {
    stats.totalRefundAmount += amount;
  }

  await ctx.store.save(stats);
}

export async function updatePresaleContractState(
  ctx: MappingContext,
  phase: number,
  merkleRoot: string,
  refundRoot: string,
  priceInBERA: bigint,
  chain: CHAINS
) {
  ctx.queue.add(async () => {
    const phaseId = `phase-${phase}-${chain}`;
    let presalePhase = await ctx.store.findOne(PresalePhase, {
      where: { id: phaseId },
    });

    if (!presalePhase) {
      presalePhase = new PresalePhase({
        id: phaseId,
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

    await ctx.store.save(presalePhase);
  });
}

export async function updatePresaleCurrentPhase(
  ctx: MappingContext,
  currentPhase: number,
  chain: CHAINS
) {
  ctx.queue.add(async () => {
    const statsId = `presale-stats-${chain}`;
    let stats = await ctx.store.findOne(PresaleStats, {
      where: { id: statsId },
    });

    if (stats) {
      stats.currentPhase = currentPhase;
      await ctx.store.save(stats);
    }
  });
}
