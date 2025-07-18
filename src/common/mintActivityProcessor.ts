import { Log } from "@subsquid/evm-processor";
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
  log: Log,
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
        log.transaction?.hash
      }-${id.toString()}-${to.toLowerCase()}`;

      const transaction = log.transaction as any;

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
          txHash: log.transaction?.hash,
          operator: operator?.toLowerCase(),
          amountPaid: transaction?.value ? BigInt(transaction.value) : 0n,
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
        const mintId = `${log.transaction?.hash}-${ids[
          i
        ].toString()}-${to.toLowerCase()}`;

        const transaction = log.transaction as any;

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
            txHash: log.transaction?.hash,
            operator: operator?.toLowerCase(),
            amountPaid: transaction?.value ? BigInt(transaction.value) : 0n,
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
  log: Log,
  contractAddress: string,
  timestamp: bigint,
  blockNumber: bigint
) {
  if (erc721Abi.events.Transfer.is(log)) {
    const { from, to, id } = erc721Abi.events.Transfer.decode(log);
    if (from.toLowerCase() === ZERO_ADDRESS) {
      const mintId = `${
        log.transaction?.hash
      }-${id.toString()}-${to.toLowerCase()}`;

      const transaction = log.transaction as any;

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
          txHash: log.transaction?.hash,
          operator: undefined,
          amountPaid: transaction?.value ? BigInt(transaction.value) : 0n,
          activityType: ActivityType.MINT,
        });
        await ctx.store.upsert(mint);
      });
    }
  }
}

export async function handleSeaportFulfill(
  ctx: MappingContext,
  log: Log,
  timestamp: bigint,
  blockNumber: bigint
) {
  if (seaportAbi.events.OrderFulfilled.is(log)) {
    const { offer, consideration, recipient, offerer } =
      seaportAbi.events.OrderFulfilled.decode(log);
    const miberaContract =
      "0x6666397DFe9a8c469BF65dc744CB1C733416c420".toLowerCase();
    const wberaContract =
      "0x6969696969696969696969696969696969696969".toLowerCase();

    if (offerer.toLowerCase() === recipient.toLowerCase()) {
      return;
    }

    let amountPaid = 0n;

    if (offer[0].token.toLowerCase() === wberaContract) {
      // offerer is buyer, recipient is seller
      amountPaid += BigInt(offer[0].amount);

      if (consideration[0].token.toLowerCase() === miberaContract) {
        // Create SALE record for the recipient (seller)
        const saleMintId = `${log.transaction?.hash}-${
          consideration[0].identifier
        }-${recipient.toLowerCase()}-sale`;

        ctx.queue.add(async () => {
          const saleMint = new MintActivity({
            id: saleMintId,
            user: recipient.toLowerCase(),
            contract: miberaContract,
            tokenStandard: "ERC721",
            tokenId: BigInt(consideration[0].identifier),
            amount: 1n,
            quantity: 1n,
            timestamp,
            blockNumber,
            txHash: log.transaction?.hash,
            operator: undefined,
            amountPaid,
            activityType: ActivityType.SALE,
          });
          await ctx.store.upsert(saleMint);
        });

        // Create PURCHASE record for the item offerer (buyer)
        const purchaseMintId = `${log.transaction?.hash}-${
          consideration[0].identifier
        }-${offerer.toLowerCase()}-purchase`;

        ctx.queue.add(async () => {
          const purchaseMint = new MintActivity({
            id: purchaseMintId,
            user: offerer.toLowerCase(),
            contract: miberaContract,
            tokenStandard: "ERC721",
            tokenId: BigInt(consideration[0].identifier),
            amount: 1n,
            quantity: 1n,
            timestamp,
            blockNumber,
            txHash: log.transaction?.hash,
            operator: undefined,
            amountPaid,
            activityType: ActivityType.PURCHASE,
          });
          await ctx.store.upsert(purchaseMint);
        });
      }
    } else if (offer[0].token.toLowerCase() === miberaContract) {
      // offerer is seller, recipient is buyer
      for (const item of consideration) {
        if (item.itemType === 0) {
          amountPaid += BigInt(item.amount);
        }
      }

      // Create SALE record for the offerer (seller)
      const saleMintId = `${log.transaction?.hash}-${
        offer[0].identifier
      }-${offerer.toLowerCase()}-sale`;

      ctx.queue.add(async () => {
        const saleMint = new MintActivity({
          id: saleMintId,
          user: offerer.toLowerCase(),
          contract: miberaContract,
          tokenStandard: "ERC721",
          tokenId: BigInt(offer[0].identifier),
          amount: 1n,
          quantity: 1n,
          timestamp,
          blockNumber,
          txHash: log.transaction?.hash,
          operator: undefined,
          amountPaid,
          activityType: ActivityType.SALE,
        });
        await ctx.store.upsert(saleMint);
      });

      // Create PURCHASE record for the item recipient (buyer)
      const purchaseMintId = `${log.transaction?.hash}-${
        offer[0].identifier
      }-${recipient.toLowerCase()}-purchase`;

      ctx.queue.add(async () => {
        const purchaseMint = new MintActivity({
          id: purchaseMintId,
          user: recipient.toLowerCase(),
          contract: miberaContract,
          tokenStandard: "ERC721",
          tokenId: BigInt(offer[0].identifier),
          amount: 1n,
          quantity: 1n,
          timestamp,
          blockNumber,
          txHash: log.transaction?.hash,
          operator: undefined,
          amountPaid,
          activityType: ActivityType.PURCHASE,
        });
        await ctx.store.upsert(purchaseMint);
      });
    }
  }
}
