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

  // Skip if the contract doesn't exist for this chain
  if (!miberaPresaleContract || miberaPresaleContract.network !== chain) {
    throw new Error(`MiberaPresale contract not configured for chain ${chain}`);
  }

  const processor = new EvmBatchProcessor();

  // Only set archive gateway if one exists for the chain
  if (ARCHIVE_ENDPOINTS[chain]) {
    processor.setGateway(ARCHIVE_ENDPOINTS[chain]);
  }

  processor
    .setRpcEndpoint({
      url: assertNotNull(CHAIN_NODE_URLS[chain], "No RPC endpoint supplied"),
    })
    .setFinalityConfirmation(75)
    .setFields({
      log: {
        transactionHash: true,
      },
    })
    .setBlockRange({ from: CHAIN_START_BLOCK[chain] });

  // Add MiberaPresale contract logs
  processor.addLog({
    address: [miberaPresaleContract.address],
    range: { from: miberaPresaleContract.startBlock },
    topic0: [
      miberaPresaleAbi.events.Participated.topic,
      miberaPresaleAbi.events.Refunded.topic,
    ],
  });

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
