import * as erc1155Abi from "../abi/erc1155";
import * as erc721Abi from "../abi/erc721";
import * as miberaTradeAbi from "../abi/miberaTrade";
import * as treasuryAbi from "../abi/treasury";
import {
  processBackingLoanExpired,
  processBackingLoanPayedBack,
  processItemLoaned,
  processItemLoanExpired,
  processItemPurchased,
  processItemRedeemed,
  processLoanItemSentBack,
  processRFVChanged,
} from "./loanProcessor";

import { StoreWithCache } from "@belopash/typeorm-store";
import { CHAINS, CONTRACTS, ContractType } from "../constants";
import { AvailableToken, DailyRFV, Loan, Trade, User } from "../model";
import { TaskQueue } from "../utils/queue";
import { processLoanReceived } from "./loanProcessor";
import { handleERC1155Mint, handleERC721Mint } from "./mintActivityProcessor";
import { handleTransferBatch, handleTransferSingle } from "./orderProcessor";
import { Context, ProcessorContext } from "./processorFactory";
import {
  processTradeAccepted,
  processTradeCancelled,
  processTradeProposed,
} from "./tradeProcessor";

export type Task = () => Promise<void>;

export type MappingContext = ProcessorContext<StoreWithCache> & {
  queue: TaskQueue;
};

export function createMultiChainMain() {
  return async (ctx: Context) => {
    for (const chain of Object.values(CHAINS)) {
      await processChain(ctx, chain);
    }
  };
}

export function createMain(chain: CHAINS) {
  return async (ctx: Context) => {
    await processChain(ctx, chain);
  };
}

async function processChain(ctx: Context, chain: CHAINS) {
  // Process loan events
  await processAllEvents({ ...ctx, queue: new TaskQueue() }, chain);
}

export async function processAllEvents(mctx: MappingContext, chain: CHAINS) {
  // Get contract addresses for quick comparison
  const addresses = {
    treasury: CONTRACTS[ContractType.Treasury]?.address.toLowerCase(),
    candies: CONTRACTS[ContractType.Candies]?.address.toLowerCase(),
    vending: CONTRACTS[ContractType.VendingMachine]?.address.toLowerCase(),
    fractureV1: CONTRACTS[ContractType.FractureV1]?.address.toLowerCase(),
    fractureV2: CONTRACTS[ContractType.FractureV2]?.address.toLowerCase(),
    fractureV3: CONTRACTS[ContractType.FractureV3]?.address.toLowerCase(),
    fractureV4: CONTRACTS[ContractType.FractureV4]?.address.toLowerCase(),
    trade: CONTRACTS[ContractType.MiberaTrade]?.address.toLowerCase(),
  };

  const entities = {
    users: new Map<string, User>(),
    loans: new Map<string, Loan>(),
    dailyRFVs: new Map<string, DailyRFV>(),
    availableTokens: new Map<string, AvailableToken>(),
    trades: new Map<string, Trade>(),
  };

  for (let block of mctx.blocks) {
    const blockNumber = BigInt(block.header.height);
    const timestamp = BigInt(block.header.timestamp);

    for (let log of block.logs) {
      const addr = log.address.toLowerCase();

      // Trade events
      if (addr === addresses.trade) {
        if (miberaTradeAbi.events.TradeProposed.is(log)) {
          await processTradeProposed(log, mctx, entities, block.header, chain);
        } else if (miberaTradeAbi.events.TradeAccepted.is(log)) {
          await processTradeAccepted(log, mctx, entities, block.header);
        } else if (miberaTradeAbi.events.TradeCancelled.is(log)) {
          await processTradeCancelled(log, mctx, entities, block.header);
        }
      }

      // Treasury events
      else if (addr === addresses.treasury) {
        // Process loan received events
        if (treasuryAbi.events.LoanReceived.is(log)) {
          await processLoanReceived(log, mctx, entities, block.header);
        }
        // Process loan expired events
        else if (treasuryAbi.events.BackingLoanExpired.is(log)) {
          await processBackingLoanExpired(log, mctx, entities, block.header);
        }
        // Process loan payback events
        else if (treasuryAbi.events.BackingLoanPayedBack.is(log)) {
          await processBackingLoanPayedBack(log, mctx, entities, block.header);
        }
        // Process RFV changed events
        else if (treasuryAbi.events.RFVChanged.is(log)) {
          await processRFVChanged(log, mctx, entities, block.header);
        }
        // Process item redeemed events (token comes into treasury)
        else if (treasuryAbi.events.ItemRedeemed.is(log)) {
          await processItemRedeemed(log, mctx, entities, block.header, chain);
        }
        // Process item purchased events (token leaves treasury)
        else if (treasuryAbi.events.ItemPurchased.is(log)) {
          await processItemPurchased(log, mctx, entities, block.header, chain);
        }
        // Process item loaned events (token leaves treasury temporarily)
        else if (treasuryAbi.events.ItemLoaned.is(log)) {
          await processItemLoaned(log, mctx, entities, block.header, chain);
        }
        // Process loan item sent back events (token returns to treasury)
        else if (treasuryAbi.events.LoanItemSentBack.is(log)) {
          await processLoanItemSentBack(
            log,
            mctx,
            entities,
            block.header,
            chain
          );
        }
        // Process item loan expired events (token no longer in treasury)
        else if (treasuryAbi.events.ItemLoanExpired.is(log)) {
          await processItemLoanExpired(
            log,
            mctx,
            entities,
            block.header,
            chain
          );
        }
      }

      // Candies (ERC1155)
      else if (addr === addresses.candies) {
        if (
          erc1155Abi.events.TransferSingle.is(log) ||
          erc1155Abi.events.TransferBatch.is(log)
        ) {
          await handleERC1155Mint(
            mctx,
            log,
            addresses.candies,
            timestamp,
            blockNumber
          );
        }

        if (erc1155Abi.events.TransferSingle.is(log)) {
          const { operator, from, to, id, amount } =
            erc1155Abi.events.TransferSingle.decode(log);
          await handleTransferSingle(
            mctx,
            operator,
            from,
            to,
            id,
            amount,
            timestamp,
            blockNumber,
            log.transaction?.hash || ""
          );
        }
        if (erc1155Abi.events.TransferBatch.is(log)) {
          const { operator, from, to, ids, amounts } =
            erc1155Abi.events.TransferBatch.decode(log);
          await handleTransferBatch(
            mctx,
            operator,
            from,
            to,
            ids,
            amounts,
            timestamp,
            blockNumber,
            log.transaction?.hash || ""
          );
        }
      }

      // VendingMachine and Fracture (ERC721)
      else if (
        addr === addresses.vending ||
        addr === addresses.fractureV1 ||
        addr === addresses.fractureV2 ||
        addr === addresses.fractureV3 ||
        addr === addresses.fractureV4
      ) {
        if (erc721Abi.events.Transfer.is(log)) {
          await handleERC721Mint(mctx, log, addr, timestamp, blockNumber);
        }
      }
    }
  }

  await mctx.store.save(Array.from(entities.users.values()));
  await mctx.store.save(Array.from(entities.loans.values()));
  await mctx.store.save(Array.from(entities.dailyRFVs.values()));
  await mctx.store.save(Array.from(entities.availableTokens.values()));
  await mctx.store.save(Array.from(entities.trades.values()));
  await mctx.queue.run();
}
