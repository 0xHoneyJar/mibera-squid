import { createProcessor } from "../common/processorFactory";
import { CHAINS } from "../constants";

export const processor = createProcessor(CHAINS.BERACHAIN);

export * from "../common/processorFactory";
