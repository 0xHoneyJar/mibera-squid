import {
  BlockHeader,
  DataHandlerContext,
  EvmBatchProcessor,
  EvmBatchProcessorFields,
  Log as _Log,
  Transaction as _Transaction,
} from "@subsquid/evm-processor";
import { assertNotNull } from "@subsquid/util-internal";
import * as treasuryAbi from "../abi/treasury";
import {
  CHAIN_NODE_URLS,
  CHAIN_START_BLOCK,
  CHAINS,
  CONTRACTS,
  ContractType,
} from "../constants";
import { StoreWithCache } from "@belopash/typeorm-store";

export function createProcessor(chain: CHAINS) {
  const treasuryContract = CONTRACTS[ContractType.Treasury];

  const processor = new EvmBatchProcessor();
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
