import { Order, UserTokenBalance } from "../model";
import { MappingContext } from "./main";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export async function handleSingleOrder(
  ctx: MappingContext,
  operator: string,
  from: string,
  to: string,
  tokenId: bigint,
  amount: bigint,
  timestamp: bigint,
  blockNumber: bigint,
  txHash: string
) {
  const toAddress = to.toLowerCase();
  const fromAddress = from.toLowerCase();
  const balanceIdTo = `${toAddress}-${tokenId.toString()}`;
  const balanceIdFrom = `${fromAddress}-${tokenId.toString()}`;

  const balanceToDeferred = ctx.store.defer(UserTokenBalance, balanceIdTo);
  let balanceFromDeferred: ReturnType<typeof ctx.store.defer> | undefined =
    undefined;
  if (fromAddress !== ZERO_ADDRESS) {
    balanceFromDeferred = ctx.store.defer(UserTokenBalance, balanceIdFrom);
  }

  ctx.queue.add(async () => {
    if (fromAddress === ZERO_ADDRESS) {
      const order = new Order({
        id: `${txHash}-${tokenId.toString()}-${toAddress}`,
        user: toAddress,
        tokenId,
        amount,
        timestamp,
        blockNumber,
        txHash,
        operator: operator.toLowerCase(),
      });
      console.log("Creating new order for mint:", {
        id: order.id,
        user: order.user,
        tokenId: order.tokenId.toString(),
        amount: order.amount.toString(),
      });
      await ctx.store.upsert(order);
    }

    // Handle recipient balance
    const balanceTo = await balanceToDeferred.getOrInsert(
      () =>
        new UserTokenBalance({
          id: balanceIdTo,
          user: toAddress,
          tokenId,
          balance: BigInt(0),
          lastUpdatedAt: timestamp,
        })
    );
    balanceTo.balance += amount;
    balanceTo.lastUpdatedAt = timestamp;
    await ctx.store.upsert(balanceTo);

    // Handle sender balance if not minting
    if (fromAddress !== ZERO_ADDRESS && balanceFromDeferred) {
      const balanceFrom = await balanceFromDeferred.getOrInsert(
        () =>
          new UserTokenBalance({
            id: balanceIdFrom,
            user: fromAddress,
            tokenId,
            balance: BigInt(0),
            lastUpdatedAt: timestamp,
          })
      );
      balanceFrom.balance =
        balanceFrom.balance > amount ? balanceFrom.balance - amount : BigInt(0);
      balanceFrom.lastUpdatedAt = timestamp;
      await ctx.store.upsert(balanceFrom);
    }
  });
}

export async function handleBatchOrder(
  ctx: MappingContext,
  operator: string,
  from: string,
  to: string,
  tokenIds: bigint[],
  amounts: bigint[],
  timestamp: bigint,
  blockNumber: bigint,
  txHash: string
) {
  const toAddress = to.toLowerCase();
  const fromAddress = from.toLowerCase();

  const balanceToDeferreds = tokenIds.map((tokenId) =>
    ctx.store.defer(UserTokenBalance, `${toAddress}-${tokenId.toString()}`)
  );
  const balanceFromDeferreds = tokenIds.map((tokenId) =>
    ctx.store.defer(UserTokenBalance, `${fromAddress}-${tokenId.toString()}`)
  );

  ctx.queue.add(async () => {
    for (let i = 0; i < tokenIds.length; i++) {
      const tokenId = tokenIds[i];
      const amount = amounts[i];
      const balanceIdTo = `${toAddress}-${tokenId.toString()}`;
      const balanceIdFrom = `${fromAddress}-${tokenId.toString()}`;

      if (fromAddress === ZERO_ADDRESS) {
        const order = new Order({
          id: `${txHash}-${tokenId.toString()}-${i}-${toAddress}`,
          user: toAddress,
          tokenId,
          amount,
          timestamp,
          blockNumber,
          txHash,
          operator: operator.toLowerCase(),
        });
        console.log("Creating new order for batch mint:", {
          id: order.id,
          user: order.user,
          tokenId: order.tokenId.toString(),
          amount: order.amount.toString(),
          index: i,
        });
        await ctx.store.upsert(order);
      }

      // Handle recipient balance
      const balanceTo = await balanceToDeferreds[i].getOrInsert(
        () =>
          new UserTokenBalance({
            id: balanceIdTo,
            user: toAddress,
            tokenId,
            balance: BigInt(0),
            lastUpdatedAt: timestamp,
          })
      );
      balanceTo.balance += amount;
      balanceTo.lastUpdatedAt = timestamp;
      await ctx.store.upsert(balanceTo);

      // Handle sender balance if not minting
      if (fromAddress !== ZERO_ADDRESS) {
        const balanceFrom = await balanceFromDeferreds[i].getOrInsert(
          () =>
            new UserTokenBalance({
              id: balanceIdFrom,
              user: fromAddress,
              tokenId,
              balance: BigInt(0),
              lastUpdatedAt: timestamp,
            })
        );
        balanceFrom.balance =
          balanceFrom.balance > amount
            ? balanceFrom.balance - amount
            : BigInt(0);
        balanceFrom.lastUpdatedAt = timestamp;
        await ctx.store.upsert(balanceFrom);
      }
    }
  });
}
