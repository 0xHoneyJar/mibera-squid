import * as miberaTradeAbi from "../abi/miberaTrade";
import { Trade, TradeStatus, User } from "../model";
import { MappingContext } from "./main";

export async function processTradeProposed(
  log: any,
  ctx: MappingContext,
  header: any,
  chain: string
) {
  const { proposer, offeredTokenId, requestedTokenId, timestamp } =
    miberaTradeAbi.events.TradeProposed.decode(log);
  const proposerAddress = proposer.toLowerCase();
  const userDeferred = ctx.store.defer(User, proposerAddress);

  ctx.queue.add(async () => {
    const user = await userDeferred.getOrInsert(
      () => new User({ id: proposerAddress })
    );
    const trade = new Trade({
      id: `${offeredTokenId.toString()}-${timestamp.toString()}`,
      proposer: user,
      offeredTokenId: BigInt(offeredTokenId),
      requestedTokenId: BigInt(requestedTokenId),
      status: TradeStatus.ACTIVE,
      proposedAt: new Date(Number(timestamp) * 1000),
      chain,
    });
    await ctx.store.upsert(trade);
  });
}

export async function processTradeAccepted(
  log: any,
  ctx: MappingContext,
  header: any
) {
  const { acceptor, offeredTokenId, requestedTokenId } =
    miberaTradeAbi.events.TradeAccepted.decode(log);
  const acceptorAddress = acceptor.toLowerCase();
  const acceptorDeferred = ctx.store.defer(User, acceptorAddress);

  ctx.queue.add(async () => {
    const acceptorUser = await acceptorDeferred.getOrInsert(
      () => new User({ id: acceptorAddress })
    );
    const trades = await ctx.store.find(Trade, {
      where: {
        offeredTokenId: BigInt(offeredTokenId),
        status: TradeStatus.ACTIVE,
      },
      order: { proposedAt: "DESC" },
    });
    if (trades.length > 0) {
      const trade = trades[0];
      trade.status = TradeStatus.COMPLETED;
      trade.acceptor = acceptorUser;
      trade.completedAt = new Date(header.timestamp);
      await ctx.store.upsert(trade);
    }
  });
}

export async function processTradeCancelled(
  log: any,
  ctx: MappingContext,
  header: any
) {
  const { offeredTokenId } = miberaTradeAbi.events.TradeCancelled.decode(log);

  ctx.queue.add(async () => {
    const trades = await ctx.store.find(Trade, {
      where: {
        offeredTokenId: BigInt(offeredTokenId),
        status: TradeStatus.ACTIVE,
      },
      order: { proposedAt: "DESC" },
    });
    if (trades.length > 0) {
      const trade = trades[0];
      trade.status = TradeStatus.CANCELLED;
      trade.completedAt = new Date(header.timestamp);
      await ctx.store.upsert(trade);
    }
  });
}
