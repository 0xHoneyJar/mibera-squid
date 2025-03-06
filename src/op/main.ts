import { createMain } from "../common/main";
import { CHAINS } from "../constants";
import { processor } from "./processor";
import { TypeormDatabaseWithCache } from "@belopash/typeorm-store";

processor.run(
  new TypeormDatabaseWithCache({
    stateSchema: CHAINS.OPTIMISM,
    isolationLevel: "READ COMMITTED",
  }),
  createMain(CHAINS.OPTIMISM)
);
