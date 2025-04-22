import { StoreWithCache } from "@belopash/typeorm-store";
import { CHAINS } from "../constants";
import { processLoanEvents } from "./loanProcessor";
import { Context } from "./processorFactory";

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
  await processLoanEvents(ctx, chain);
}
