import { StoreWithCache } from "@belopash/typeorm-store";

export enum ContractType {
  Treasury = "Treasury",
}

export enum CHAINS {
  BERACHAIN = "berachain",
}

export const CHAIN_START_BLOCK = {
  [CHAINS.BERACHAIN]: 1953786,
} as const;

export const CONTRACTS: {
  [key in ContractType]: {
    address: string;
    network: CHAINS;
    startBlock: number;
  };
} = {
  [ContractType.Treasury]: {
    address: "0xaa04F13994A7fCd86F3BbbF4054d239b88F2744d",
    network: CHAINS.BERACHAIN,
    startBlock: 3971122,
  },
} as const;

export const CHAIN_NODE_URLS = {
  [CHAINS.BERACHAIN]: process.env.RPC_BERACHAIN_HTTP,
} as const;

export const ARCHIVE_ENDPOINTS: Partial<Record<CHAINS, string>> = {
  [CHAINS.BERACHAIN]:
    "https://v2.archive.subsquid.io/network/berachain-mainnet",
} as const;
