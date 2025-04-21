import {
  BlockHeader,
  DataHandlerContext,
  EvmBatchProcessor,
  EvmBatchProcessorFields,
  Log as _Log,
  Transaction as _Transaction,
} from "@subsquid/evm-processor";
import { assertNotNull } from "@subsquid/util-internal";
import * as miberaPresaleAbi from "../abi/miberaPresale";
import * as treasuryAbi from "../abi/treasury";
import {
  ARCHIVE_ENDPOINTS,
  CHAIN_NODE_URLS,
  CHAIN_START_BLOCK,
  CHAINS,
  CONTRACTS,
  ContractType,
} from "../constants";
import { StoreWithCache } from "@belopash/typeorm-store";

export function createProcessor(chain: CHAINS) {
  const miberaPresaleContract = CONTRACTS[ContractType.MiberaPresale];
  const treasuryContract = CONTRACTS[ContractType.Treasury];

  const processor = new EvmBatchProcessor();

  // Only set archive gateway if one exists for the chain
  if (ARCHIVE_ENDPOINTS[chain]) {
    // processor.setGateway(ARCHIVE_ENDPOINTS[chain]);
  }

  processor
    .setPortal(assertNotNull(
        process.env.PORTAL_URL, 
        'Required env variable PORTAL_URL is missing'
    ))
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
      },
    })
    .setBlockRange({ from: CHAIN_START_BLOCK[chain] });

  // Skip if the MiberaPresale contract doesn't exist for this chain
  if (miberaPresaleContract && miberaPresaleContract.network === chain) {
    processor.addLog({
      address: [miberaPresaleContract.address],
      range: { from: miberaPresaleContract.startBlock },
      topic0: [
        miberaPresaleAbi.events.Participated.topic,
        miberaPresaleAbi.events.Refunded.topic,
      ],
    });
  }

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
      ],
      transaction: true,
    });
  }

  return processor;
}

export type Fields = EvmBatchProcessorFields<
  ReturnType<typeof createProcessor>
>;
export type Context = DataHandlerContext<StoreWithCache, Fields>;
export type Block = BlockHeader<Fields>;
export type Log = _Log<Fields>;
export type Transaction = _Transaction<Fields>;
export type ProcessorContext<Store> = DataHandlerContext<Store, Fields>;
