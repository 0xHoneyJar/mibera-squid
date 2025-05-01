import * as erc1155Abi from "../abi/erc1155";
import * as erc721Abi from "../abi/erc721";
import * as seaportAbi from "../abi/seaport";
import { ContractType } from "../constants";
import { ActivityType, MintActivity } from "../model";
import { Context } from "./processorFactory";

type Task = () => Promise<void>;
type MappingContext = Context & {
  store: any;
  queue: Task[];
};

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const ERC1155_CONTRACTS = [ContractType.Candies];
const ERC721_CONTRACTS = [
  ContractType.VendingMachine,
  ContractType.FractureV1,
  ContractType.FractureV2,
  ContractType.FractureV3,
];

export async function handleERC1155Mint(
  mctx: any,
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
      await saveMintActivity(
        mctx,
        to,
        contractAddress,
        "ERC1155",
        id,
        amount,
        1n,
        timestamp,
        blockNumber,
        log.transactionHash,
        operator,
        log,
        ActivityType.MINT
      );
    }
  }
  // ERC1155: TransferBatch
  else if (erc1155Abi.events.TransferBatch.is(log)) {
    const { operator, from, to, ids, amounts } =
      erc1155Abi.events.TransferBatch.decode(log);
    if (from.toLowerCase() === ZERO_ADDRESS) {
      for (let i = 0; i < ids.length; i++) {
        await saveMintActivity(
          mctx,
          to,
          contractAddress,
          "ERC1155",
          ids[i],
          amounts[i],
          1n,
          timestamp,
          blockNumber,
          log.transactionHash,
          operator,
          log,
          ActivityType.MINT
        );
      }
    }
  }
}

export async function handleERC721Mint(
  mctx: any,
  log: any,
  contractAddress: string,
  timestamp: bigint,
  blockNumber: bigint
) {
  if (erc721Abi.events.Transfer.is(log)) {
    const { from, to, id } = erc721Abi.events.Transfer.decode(log);
    if (from.toLowerCase() === ZERO_ADDRESS) {
      await saveMintActivity(
        mctx,
        to,
        contractAddress,
        "ERC721",
        id,
        1n,
        1n,
        timestamp,
        blockNumber,
        log.transactionHash,
        undefined,
        log,
        ActivityType.MINT
      );
    }
  }
}

export async function handleSeaportFulfill(
  mctx: any,
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
        await saveMintActivity(
          mctx,
          recipient,
          miberaContract,
          "ERC721",
          BigInt(item.identifier),
          1n,
          1n,
          timestamp,
          blockNumber,
          log.transactionHash,
          undefined,
          { transaction: { value: amountPaid.toString() } },
          ActivityType.PURCHASE
        );
      }
    }

    // Check consideration items (represents a sale)
    for (const item of consideration) {
      if (item.token.toLowerCase() === miberaContract) {
        await saveMintActivity(
          mctx,
          item.recipient,
          miberaContract,
          "ERC721",
          BigInt(item.identifier),
          1n,
          1n,
          timestamp,
          blockNumber,
          log.transactionHash,
          undefined,
          { transaction: { value: amountPaid.toString() } },
          ActivityType.SALE
        );
      }
    }
  }
}

async function saveMintActivity(
  mctx: any,
  user: string,
  contract: string,
  tokenStandard: string,
  tokenId: bigint,
  amount: bigint,
  quantity: bigint,
  timestamp: bigint,
  blockNumber: bigint,
  txHash: string,
  operator: string | undefined,
  log: any,
  activityType: ActivityType
) {
  // Get the transaction value (amount paid in native token)
  const amountPaid = log.transaction?.value
    ? BigInt(log.transaction.value)
    : 0n;

  const id = `${txHash}-${tokenId?.toString() || ""}-${user.toLowerCase()}`;
  const mint = new MintActivity({
    id,
    user: user.toLowerCase(),
    contract: contract.toLowerCase(),
    tokenStandard,
    tokenId,
    amount,
    quantity,
    timestamp,
    blockNumber,
    txHash,
    operator: operator ? operator.toLowerCase() : undefined,
    amountPaid,
    activityType,
  });
  await mctx.store.save(mint);
}
