import { createProcessor } from "../common/processorFactory";
import { CHAINS } from "../constants";

export const processor = createProcessor(CHAINS.ZORA);

export * from "../common/processorFactory";
