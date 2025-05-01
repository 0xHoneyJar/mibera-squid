import * as miberaTradeAbi from "../abi/miberaTrade";
import { Trade, TradeStatus, User } from "../model";
import { MappingContext } from "./main";

export async function processTradeProposed(
  log: any,
  mctx: MappingContext,
  entities: any,
  header: any,
  chain: string
) {
  const { proposer, offeredTokenId, requestedTokenId, timestamp } =
    miberaTradeAbi.events.TradeProposed.decode(log);
  const proposerAddress = proposer.toLowerCase();

  // Phase 1: Defer database reads
  mctx.store.defer(User, proposerAddress);

  // Add phase 2 to queue
  mctx.queue.add(async () => {
    // Phase 2: Get entities and make updates
    let user =
      entities.users.get(proposerAddress) ||
      (await mctx.store.get(User, proposerAddress));
    if (!user) {
      user = new User({ id: proposerAddress });
    }
    entities.users.set(proposerAddress, user);

    const trade = new Trade({
      id: `${offeredTokenId.toString()}-${timestamp.toString()}`,
      proposer: user,
      offeredTokenId: BigInt(offeredTokenId),
      requestedTokenId: BigInt(requestedTokenId),
      status: TradeStatus.ACTIVE,
      proposedAt: new Date(Number(timestamp) * 1000),
      chain,
    });
    entities.trades.set(trade.id, trade);
  });
}

export async function processTradeAccepted(
  log: any,
  mctx: MappingContext,
  entities: any,
  header: any
) {
  const { acceptor, offeredTokenId, requestedTokenId } =
    miberaTradeAbi.events.TradeAccepted.decode(log);
  const acceptorAddress = acceptor.toLowerCase();

  // Phase 1: Defer database reads
  mctx.store.defer(User, acceptorAddress);

  // We'll handle Trade query in phase 2 since we need complex query options

  // Add phase 2 to queue
  mctx.queue.add(async () => {
    // Phase 2: Get entities and make updates
    let acceptorUser =
      entities.users.get(acceptorAddress) ||
      (await mctx.store.get(User, acceptorAddress));
    if (!acceptorUser) {
      acceptorUser = new User({ id: acceptorAddress });
      entities.users.set(acceptorAddress, acceptorUser);
    }

    const trades = await mctx.store.find(Trade, {
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
      entities.trades.set(trade.id, trade);
    }
  });
}

export async function processTradeCancelled(
  log: any,
  mctx: MappingContext,
  entities: any,
  header: any
) {
  const { offeredTokenId } = miberaTradeAbi.events.TradeCancelled.decode(log);

  // We'll handle Trade query in phase 2 since we need complex query options

  // Add phase 2 to queue
  mctx.queue.add(async () => {
    // Phase 2: Get entities and make updates
    const trades = await mctx.store.find(Trade, {
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
      entities.trades.set(trade.id, trade);
    }
  });
}
