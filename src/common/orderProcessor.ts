import * as erc1155Abi from "../abi/erc1155";
import { CHAINS, CONTRACTS, ContractType } from "../constants";
import { Order, UserTokenBalance } from "../model";
import { Context } from "./processorFactory";

type Task = () => Promise<void>;
type MappingContext = Context & {
  store: any;
  queue: Task[];
};

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export async function processOrderEvents(ctx: Context, chain: CHAINS) {
  const mctx: MappingContext = { ...ctx, queue: [] };

  for (let block of ctx.blocks) {
    await processOrderBlock(mctx, block, chain);
  }

  for (let task of mctx.queue) {
    await task();
  }
}

async function processOrderBlock(
  mctx: MappingContext,
  block: any,
  chain: CHAINS
) {
  const candiesContract = CONTRACTS[ContractType.Candies];
  const currentBlockNumber = BigInt(block.header.height);
  const timestamp = BigInt(block.header.timestamp);

  if (
    !candiesContract ||
    candiesContract.network !== chain ||
    currentBlockNumber < BigInt(candiesContract.startBlock)
  ) {
    return;
  }

  for (let log of block.logs) {
    if (log.address.toLowerCase() !== candiesContract.address.toLowerCase())
      continue;

    if (erc1155Abi.events.TransferSingle.is(log)) {
      const { operator, from, to, id, amount } =
        erc1155Abi.events.TransferSingle.decode(log);
      mctx.queue.push(async () => {
        await handleTransferSingle(
          mctx,
          operator,
          from,
          to,
          id,
          amount,
          timestamp,
          currentBlockNumber,
          log.transactionHash
        );
      });
    } else if (erc1155Abi.events.TransferBatch.is(log)) {
      const { operator, from, to, ids, amounts } =
        erc1155Abi.events.TransferBatch.decode(log);
      mctx.queue.push(async () => {
        await handleTransferBatch(
          mctx,
          operator,
          from,
          to,
          ids,
          amounts,
          timestamp,
          currentBlockNumber,
          log.transactionHash
        );
      });
    }
  }
}

async function handleTransferSingle(
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

async function handleTransferBatch(
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
