import { Order, UserTokenBalance } from "../model";
import { MappingContext } from "./main";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export async function handleTransferSingle(
  mctx: MappingContext,
  operator: string,
  from: string,
  to: string,
  tokenId: bigint,
  amount: bigint,
  timestamp: bigint,
  blockNumber: bigint,
  txHash: string
) {
  if (from.toLowerCase() === ZERO_ADDRESS) {
    const order = new Order({
      id: `${txHash}-${tokenId.toString()}-${to.toLowerCase()}`,
      user: to.toLowerCase(),
      tokenId,
      amount,
      timestamp,
      blockNumber,
      txHash,
      operator: operator.toLowerCase(),
    });
    await mctx.store.save(order);
  }
  await updateUserTokenBalance(mctx, to, tokenId, amount, true, timestamp);
  if (from.toLowerCase() !== ZERO_ADDRESS) {
    await updateUserTokenBalance(mctx, from, tokenId, amount, false, timestamp);
  }
}

export async function handleTransferBatch(
  mctx: MappingContext,
  operator: string,
  from: string,
  to: string,
  tokenIds: bigint[],
  amounts: bigint[],
  timestamp: bigint,
  blockNumber: bigint,
  txHash: string
) {
  for (let i = 0; i < tokenIds.length; i++) {
    const tokenId = tokenIds[i];
    const amount = amounts[i];
    if (from.toLowerCase() === ZERO_ADDRESS) {
      const order = new Order({
        id: `${txHash}-${tokenId.toString()}-${i}-${to.toLowerCase()}`,
        user: to.toLowerCase(),
        tokenId,
        amount,
        timestamp,
        blockNumber,
        txHash,
        operator: operator.toLowerCase(),
      });
      await mctx.store.save(order);
    }
    await updateUserTokenBalance(mctx, to, tokenId, amount, true, timestamp);
    if (from.toLowerCase() !== ZERO_ADDRESS) {
      await updateUserTokenBalance(
        mctx,
        from,
        tokenId,
        amount,
        false,
        timestamp
      );
    }
  }
}

async function updateUserTokenBalance(
  mctx: MappingContext,
  user: string,
  tokenId: bigint,
  amount: bigint,
  isAddition: boolean,
  timestamp: bigint
) {
  const balanceId = `${user.toLowerCase()}-${tokenId.toString()}`;
  let balance = await mctx.store.findOne(UserTokenBalance, {
    where: { id: balanceId },
  });
  if (!balance) {
    balance = new UserTokenBalance({
      id: balanceId,
      user: user.toLowerCase(),
      tokenId,
      balance: BigInt(0),
      lastUpdatedAt: timestamp,
    });
  }
  balance.balance = isAddition
    ? balance.balance + amount
    : balance.balance - amount;
  if (balance.balance < BigInt(0)) balance.balance = BigInt(0);
  balance.lastUpdatedAt = timestamp;
  await mctx.store.save(balance);
}
