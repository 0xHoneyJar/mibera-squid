import { StoreWithCache } from "@belopash/typeorm-store";
import {
  Log as _Log,
  Transaction as _Transaction,
  BlockHeader,
  DataHandlerContext,
  EvmBatchProcessor,
  EvmBatchProcessorFields,
} from "@subsquid/evm-processor";
import { assertNotNull } from "@subsquid/util-internal";
import { zeroAddress } from "viem";
import * as erc1155Abi from "../abi/erc1155";
import * as erc721Abi from "../abi/erc721";
import * as miberaTradeAbi from "../abi/miberaTrade";
import * as seaportAbi from "../abi/seaport";
import * as treasuryAbi from "../abi/treasury";
import {
  CHAIN_NODE_URLS,
  CHAIN_START_BLOCK,
  CHAINS,
  CONTRACTS,
  ContractType,
} from "../constants";

export function createProcessor(chain: CHAINS) {
  const treasuryContract = CONTRACTS[ContractType.Treasury];
  const presaleContract = CONTRACTS[ContractType.Presale];
  const candiesContract = CONTRACTS[ContractType.Candies];
  const vendingMachineContract = CONTRACTS[ContractType.VendingMachine];
  const fractureV1Contract = CONTRACTS[ContractType.FractureV1];
  const fractureV2Contract = CONTRACTS[ContractType.FractureV2];
  const fractureV3Contract = CONTRACTS[ContractType.FractureV3];
  const fractureV4Contract = CONTRACTS[ContractType.FractureV4];
  const fractureV5Contract = CONTRACTS[ContractType.FractureV5];
  const fractureV6Contract = CONTRACTS[ContractType.FractureV6];
  const fractureV7Contract = CONTRACTS[ContractType.FractureV7];
  const seaportContract = CONTRACTS[ContractType.Seaport];
  const miberaTradeContract = CONTRACTS[ContractType.MiberaTrade];

  const processor = new EvmBatchProcessor();
  processor
    .setPortal(
      assertNotNull(
        process.env.PORTAL_URL,
        "Required env variable PORTAL_URL is missing"
      )
    )
    .setRpcEndpoint({
      url: assertNotNull(CHAIN_NODE_URLS[chain], "No RPC endpoint supplied"),
    })
    .setFinalityConfirmation(10)
    .setFields({
      log: {
        transactionHash: true,
      },
      transaction: {
        from: true,
        value: true,
      },
    })
    .setBlockRange({ from: CHAIN_START_BLOCK[chain] });

  // Skip if the Treasury contract doesn't exist for this chain
  if (treasuryContract && treasuryContract.network === chain) {
    processor.addLog({
      address: [treasuryContract.address],
      range: { from: treasuryContract.startBlock },
      topic0: [
        treasuryAbi.events.LoanReceived.topic,
        treasuryAbi.events.BackingLoanExpired.topic,
        treasuryAbi.events.BackingLoanPayedBack.topic,
        treasuryAbi.events.RFVChanged.topic,
        treasuryAbi.events.ItemRedeemed.topic,
        treasuryAbi.events.ItemPurchased.topic,
        treasuryAbi.events.ItemLoaned.topic,
        treasuryAbi.events.LoanItemSentBack.topic,
        treasuryAbi.events.ItemLoanExpired.topic,
      ],
      transaction: true,
    });
  }

  // Add Trade contract events if configured
  if (miberaTradeContract && miberaTradeContract.network === chain) {
    processor.addLog({
      address: [miberaTradeContract.address],
      range: { from: miberaTradeContract.startBlock },
      topic0: [
        miberaTradeAbi.events.TradeProposed.topic,
        miberaTradeAbi.events.TradeAccepted.topic,
        miberaTradeAbi.events.TradeCancelled.topic,
      ],
    });
  }

  if (candiesContract && candiesContract.network === chain) {
    processor.addLog({
      address: [candiesContract.address],
      range: { from: candiesContract.startBlock },
      topic0: [
        erc1155Abi.events.TransferSingle.topic,
        erc1155Abi.events.TransferBatch.topic,
      ],
      topic1: [formatAddressTopic(zeroAddress)],
      transaction: true,
    });
  }

  // Repeat for vendingMachineContract, fractureV1Contract, etc. with ERC721 Transfer event
  if (vendingMachineContract && vendingMachineContract.network === chain) {
    processor.addLog({
      address: [vendingMachineContract.address],
      range: { from: vendingMachineContract.startBlock },
      topic0: [erc721Abi.events.Transfer.topic],
      topic1: [formatAddressTopic(zeroAddress)],
      transaction: true,
    });
  }

  if (fractureV1Contract && fractureV1Contract.network === chain) {
    processor.addLog({
      address: [fractureV1Contract.address],
      range: { from: fractureV1Contract.startBlock },
      topic0: [erc721Abi.events.Transfer.topic],
      topic1: [formatAddressTopic(zeroAddress)],
      transaction: true,
    });
  }

  if (fractureV2Contract && fractureV2Contract.network === chain) {
    processor.addLog({
      address: [fractureV2Contract.address],
      range: { from: fractureV2Contract.startBlock },
      topic0: [erc721Abi.events.Transfer.topic],
      topic1: [formatAddressTopic(zeroAddress)],
      transaction: true,
    });
  }

  if (fractureV3Contract && fractureV3Contract.network === chain) {
    processor.addLog({
      address: [fractureV3Contract.address],
      range: { from: fractureV3Contract.startBlock },
      topic0: [erc721Abi.events.Transfer.topic],
      topic1: [formatAddressTopic(zeroAddress)],
      transaction: true,
    });
  }

  if (fractureV4Contract && fractureV4Contract.network === chain) {
    processor.addLog({
      address: [fractureV4Contract.address],
      range: { from: fractureV4Contract.startBlock },
      topic0: [erc721Abi.events.Transfer.topic],
      topic1: [formatAddressTopic(zeroAddress)],
      transaction: true,
    });
  }

  if (fractureV5Contract && fractureV5Contract.network === chain) {
    processor.addLog({
      address: [fractureV5Contract.address],
      range: { from: fractureV5Contract.startBlock },
      topic0: [erc721Abi.events.Transfer.topic],
      topic1: [formatAddressTopic(zeroAddress)],
      transaction: true,
    });
  }

  if (fractureV6Contract && fractureV6Contract.network === chain) {
    processor.addLog({
      address: [fractureV6Contract.address],
      range: { from: fractureV6Contract.startBlock },
      topic0: [erc721Abi.events.Transfer.topic],
      transaction: true,
    });
  }

  if (fractureV7Contract && fractureV7Contract.network === chain) {
    processor.addLog({
      address: [fractureV7Contract.address],
      range: { from: fractureV7Contract.startBlock },
      topic0: [erc721Abi.events.Transfer.topic],
      transaction: true,
    });
  }

  // Add Seaport contract events if configured
  if (seaportContract && seaportContract.network === chain) {
    processor.addLog({
      address: [seaportContract.address],
      range: { from: seaportContract.startBlock },
      topic0: [seaportAbi.events.OrderFulfilled.topic],
      transaction: true,
    });
  }

  return processor;
}

function formatAddressTopic(address: string): string {
  return "0x" + address.replace("0x", "").padStart(64, "0").toLowerCase();
}

export type Fields = EvmBatchProcessorFields<
  ReturnType<typeof createProcessor>
>;
export type Context = DataHandlerContext<StoreWithCache, Fields>;
export type Block = BlockHeader<Fields>;
export type Log = _Log<Fields>;
export type Transaction = _Transaction<Fields>;
export type ProcessorContext<Store> = DataHandlerContext<Store, Fields>;
