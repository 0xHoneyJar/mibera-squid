import * as erc1155Abi from "../abi/erc1155";
import * as erc721Abi from "../abi/erc721";
import * as presaleAbi from "../abi/miberaPresale";
import * as miberaTradeAbi from "../abi/miberaTrade";
import * as seaportAbi from "../abi/seaport";
import * as treasuryAbi from "../abi/treasury";
import {
  processBackingLoanExpired,
  processBackingLoanPayedBack,
  processItemLoaned,
  processItemLoanExpired,
  processItemPurchased,
  processItemRedeemed,
  processLoanItemSentBack,
  processLoanReceived,
  processRFVChanged,
} from "./loanProcessor";

import { StoreWithCache } from "@belopash/typeorm-store";
import { CHAINS, CONTRACTS, ContractType } from "../constants";
import { TaskQueue } from "../utils/queue";
import {
  handleERC1155Mint,
  handleERC721Mint,
  handleSeaportFulfill,
} from "./mintActivityProcessor";
import {
  handleBatchOrder,
  handleSingleOrder,
  ZERO_ADDRESS,
} from "./orderProcessor";
import { processParticipated, processRefunded } from "./presaleProcessor";
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
  await processAllEvents({ ...ctx, queue: new TaskQueue() }, chain);
}

export async function processAllEvents(ctx: MappingContext, chain: CHAINS) {
  const addresses = {
    treasury: CONTRACTS[ContractType.Treasury]?.address.toLowerCase(),
    candies: CONTRACTS[ContractType.Candies]?.address.toLowerCase(),
    vending: CONTRACTS[ContractType.VendingMachine]?.address.toLowerCase(),
    fractureV1: CONTRACTS[ContractType.FractureV1]?.address.toLowerCase(),
    fractureV2: CONTRACTS[ContractType.FractureV2]?.address.toLowerCase(),
    fractureV3: CONTRACTS[ContractType.FractureV3]?.address.toLowerCase(),
    fractureV4: CONTRACTS[ContractType.FractureV4]?.address.toLowerCase(),
    fractureV5: CONTRACTS[ContractType.FractureV5]?.address.toLowerCase(),
    fractureV6: CONTRACTS[ContractType.FractureV6]?.address.toLowerCase(),
    fractureV7: CONTRACTS[ContractType.FractureV7]?.address.toLowerCase(),
    trade: CONTRACTS[ContractType.MiberaTrade]?.address.toLowerCase(),
    seaport: CONTRACTS[ContractType.Seaport]?.address.toLowerCase(),
    presale: CONTRACTS[ContractType.Presale]?.address.toLowerCase(),
  };

  for (let block of ctx.blocks) {
    const blockNumber = BigInt(block.header.height);
    const timestamp = BigInt(block.header.timestamp);

    for (let log of block.logs) {
      const addr = log.address.toLowerCase();

      // Trade events
      if (addr === addresses.trade) {
        if (miberaTradeAbi.events.TradeProposed.is(log)) {
          console.log("Processing TradeProposed event");
          await processTradeProposed(log, ctx, block.header, chain);
        } else if (miberaTradeAbi.events.TradeAccepted.is(log)) {
          console.log("Processing TradeAccepted event");
          await processTradeAccepted(log, ctx, block.header);
        } else if (miberaTradeAbi.events.TradeCancelled.is(log)) {
          console.log("Processing TradeCancelled event");
          await processTradeCancelled(log, ctx, block.header);
        }
      }

      // Treasury events
      else if (addr === addresses.treasury) {
        if (treasuryAbi.events.LoanReceived.is(log)) {
          console.log("Processing LoanReceived event");
          await processLoanReceived(log, ctx, block.header);
        } else if (treasuryAbi.events.BackingLoanExpired.is(log)) {
          console.log("Processing BackingLoanExpired event");
          await processBackingLoanExpired(log, ctx, block.header);
        } else if (treasuryAbi.events.BackingLoanPayedBack.is(log)) {
          console.log("Processing BackingLoanPayedBack event");
          await processBackingLoanPayedBack(log, ctx, block.header);
        } else if (treasuryAbi.events.RFVChanged.is(log)) {
          console.log("Processing RFVChanged event");
          await processRFVChanged(log, ctx, block.header);
        } else if (treasuryAbi.events.ItemRedeemed.is(log)) {
          console.log("Processing ItemRedeemed event");
          await processItemRedeemed(log, ctx, block.header, chain);
        } else if (treasuryAbi.events.ItemPurchased.is(log)) {
          console.log("Processing ItemPurchased event");
          await processItemPurchased(log, ctx, block.header, chain);
        } else if (treasuryAbi.events.ItemLoaned.is(log)) {
          console.log("Processing ItemLoaned event");
          await processItemLoaned(log, ctx, block.header, chain);
        } else if (treasuryAbi.events.LoanItemSentBack.is(log)) {
          console.log("Processing LoanItemSentBack event");
          await processLoanItemSentBack(log, ctx, block.header, chain);
        } else if (treasuryAbi.events.ItemLoanExpired.is(log)) {
          console.log("Processing ItemLoanExpired event");
          await processItemLoanExpired(log, ctx, block.header, chain);
        }
      }

      // Candies (ERC1155)
      else if (addr === addresses.candies) {
        if (
          erc1155Abi.events.TransferSingle.is(log) ||
          erc1155Abi.events.TransferBatch.is(log)
        ) {
          console.log("Processing ERC1155 Mint event");
          await handleERC1155Mint(
            ctx,
            log,
            addresses.candies,
            timestamp,
            blockNumber
          );
        }

        if (erc1155Abi.events.TransferSingle.is(log)) {
          const { operator, from, to, id, amount } =
            erc1155Abi.events.TransferSingle.decode(log);
          console.log("Processing ERC1155 TransferSingle event", {
            from,
            to,
            id: id.toString(),
            amount: amount.toString(),
            isMint: from.toLowerCase() === ZERO_ADDRESS.toLowerCase(),
          });
          await handleSingleOrder(
            ctx,
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
          console.log("Processing ERC1155 TransferBatch event", {
            from,
            to,
            ids: ids.map((id) => id.toString()),
            amounts: amounts.map((amount) => amount.toString()),
            isMint: from.toLowerCase() === ZERO_ADDRESS.toLowerCase(),
          });
          await handleBatchOrder(
            ctx,
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
        addr === addresses.fractureV4 ||
        addr === addresses.fractureV5 ||
        addr === addresses.fractureV6 ||
        addr === addresses.fractureV7
      ) {
        if (erc721Abi.events.Transfer.is(log)) {
          console.log("Processing ERC721 Transfer event");
          await handleERC721Mint(ctx, log, addr, timestamp, blockNumber);
        }
      }

      // Seaport
      else if (addr === addresses.seaport) {
        if (seaportAbi.events.OrderFulfilled.is(log)) {
          console.log("Processing Seaport OrderFulfilled event");
          await handleSeaportFulfill(ctx, log, timestamp, blockNumber);
        }
      }

      // Presale events
      else if (addr === addresses.presale) {
        if (presaleAbi.events.Participated.is(log)) {
          console.log("Processing Presale Participated event");
          await processParticipated(log, ctx, block.header, chain);
        } else if (presaleAbi.events.Refunded.is(log)) {
          console.log("Processing Presale Refunded event");
          await processRefunded(log, ctx, block.header, chain);
        }
      }
    }
  }

  await ctx.queue.run();
}
