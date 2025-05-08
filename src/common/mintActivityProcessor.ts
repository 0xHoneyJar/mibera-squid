import * as erc1155Abi from "../abi/erc1155";
import * as erc721Abi from "../abi/erc721";
import * as seaportAbi from "../abi/seaport";
import { ContractType } from "../constants";
import { ActivityType, MintActivity } from "../model";
import { MappingContext } from "./main";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const ERC1155_CONTRACTS = [ContractType.Candies];
const ERC721_CONTRACTS = [
  ContractType.VendingMachine,
  ContractType.FractureV1,
  ContractType.FractureV2,
  ContractType.FractureV3,
];

export async function handleERC1155Mint(
  ctx: MappingContext,
  log: any,
  contractAddress: string,
  timestamp: bigint,
  blockNumber: bigint
) {
  // ERC1155: TransferSingle
  if (erc1155Abi.events.TransferSingle.is(log)) {
    const { operator, from, to, id, amount } =
      erc1155Abi.events.TransferSingle.decode(log);
    if (from.toLowerCase() === ZERO_ADDRESS) {
      const mintId = `${
        log.transactionHash
      }-${id.toString()}-${to.toLowerCase()}`;

      ctx.queue.add(async () => {
        const mint = new MintActivity({
          id: mintId,
          user: to.toLowerCase(),
          contract: contractAddress.toLowerCase(),
          tokenStandard: "ERC1155",
          tokenId: id,
          amount,
          quantity: 1n,
          timestamp,
          blockNumber,
          txHash: log.transactionHash,
          operator: operator?.toLowerCase(),
          amountPaid: log.transaction?.value
            ? BigInt(log.transaction.value)
            : 0n,
          activityType: ActivityType.MINT,
        });
        await ctx.store.upsert(mint);
      });
    }
  }
  // ERC1155: TransferBatch
  else if (erc1155Abi.events.TransferBatch.is(log)) {
    const { operator, from, to, ids, amounts } =
      erc1155Abi.events.TransferBatch.decode(log);
    if (from.toLowerCase() === ZERO_ADDRESS) {
      for (let i = 0; i < ids.length; i++) {
        const mintId = `${log.transactionHash}-${ids[
          i
        ].toString()}-${to.toLowerCase()}`;

        ctx.queue.add(async () => {
          const mint = new MintActivity({
            id: mintId,
            user: to.toLowerCase(),
            contract: contractAddress.toLowerCase(),
            tokenStandard: "ERC1155",
            tokenId: ids[i],
            amount: amounts[i],
            quantity: 1n,
            timestamp,
            blockNumber,
            txHash: log.transactionHash,
            operator: operator?.toLowerCase(),
            amountPaid: log.transaction?.value
              ? BigInt(log.transaction.value)
              : 0n,
            activityType: ActivityType.MINT,
          });
          await ctx.store.upsert(mint);
        });
      }
    }
  }
}

export async function handleERC721Mint(
  ctx: MappingContext,
  log: any,
  contractAddress: string,
  timestamp: bigint,
  blockNumber: bigint
) {
  if (erc721Abi.events.Transfer.is(log)) {
    const { from, to, id } = erc721Abi.events.Transfer.decode(log);
    if (from.toLowerCase() === ZERO_ADDRESS) {
      const mintId = `${
        log.transactionHash
      }-${id.toString()}-${to.toLowerCase()}`;

      ctx.queue.add(async () => {
        const mint = new MintActivity({
          id: mintId,
          user: to.toLowerCase(),
          contract: contractAddress.toLowerCase(),
          tokenStandard: "ERC721",
          tokenId: id,
          amount: 1n,
          quantity: 1n,
          timestamp,
          blockNumber,
          txHash: log.transactionHash,
          operator: undefined,
          amountPaid: log.transaction?.value
            ? BigInt(log.transaction.value)
            : 0n,
          activityType: ActivityType.MINT,
        });
        await ctx.store.upsert(mint);
      });
    }
  }
}

export async function handleSeaportFulfill(
  ctx: MappingContext,
  log: any,
  timestamp: bigint,
  blockNumber: bigint
) {
  if (seaportAbi.events.OrderFulfilled.is(log)) {
    const { offer, consideration, recipient } =
      seaportAbi.events.OrderFulfilled.decode(log);
    const miberaContract =
      "0x6666397DFe9a8c469BF65dc744CB1C733416c420".toLowerCase();

    // Calculate total amount paid in native token
    let amountPaid = 0n;
    for (const item of consideration) {
      if (item.itemType === 0) {
        // Native token (ETH)
        amountPaid += BigInt(item.amount);
      }
    }

    // Look for MIBERA tokens in the offer items (represents a purchase)
    for (const item of offer) {
      if (item.token.toLowerCase() === miberaContract) {
        const mintId = `${log.transactionHash}-${
          item.identifier
        }-${recipient.toLowerCase()}-purchase`;

        ctx.queue.add(async () => {
          const mint = new MintActivity({
            id: mintId,
            user: recipient.toLowerCase(),
            contract: miberaContract,
            tokenStandard: "ERC721",
            tokenId: BigInt(item.identifier),
            amount: 1n,
            quantity: 1n,
            timestamp,
            blockNumber,
            txHash: log.transactionHash,
            operator: undefined,
            amountPaid,
            activityType: ActivityType.PURCHASE,
          });
          await ctx.store.upsert(mint);
        });
      }
    }

    // Check consideration items (represents a sale)
    for (const item of consideration) {
      if (item.token.toLowerCase() === miberaContract) {
        const mintId = `${log.transactionHash}-${
          item.identifier
        }-${item.recipient.toLowerCase()}-sale`;

        ctx.queue.add(async () => {
          const mint = new MintActivity({
            id: mintId,
            user: item.recipient.toLowerCase(),
            contract: miberaContract,
            tokenStandard: "ERC721",
            tokenId: BigInt(item.identifier),
            amount: 1n,
            quantity: 1n,
            timestamp,
            blockNumber,
            txHash: log.transactionHash,
            operator: undefined,
            amountPaid,
            activityType: ActivityType.SALE,
          });
          await ctx.store.upsert(mint);
        });
      }
    }
  }
}
