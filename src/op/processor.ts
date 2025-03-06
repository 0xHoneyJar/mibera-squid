import { createProcessor } from "../common/processorFactory";
import { CHAINS } from "../constants";

export const processor = createProcessor(CHAINS.OPTIMISM);

export * from "../common/processorFactory";
