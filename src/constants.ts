export enum ContractType {
  MiberaPresale = "MiberaPresale",
}

export enum CHAINS {
  BERACHAIN = "berachain",
}

export const CHAIN_START_BLOCK = {
  [CHAINS.BERACHAIN]: 761201,
} as const;

export const CONTRACTS: {
  [key in ContractType]: {
    address: string;
    network: CHAINS;
    startBlock: number;
  };
} = {
  [ContractType.MiberaPresale]: {
    address: "0xf560219c0ccD98cD517B6cAFd4A3D62c00628B28" as const,
    network: CHAINS.BERACHAIN,
    startBlock: 16751283,
  },
} as const;

export const CHAIN_NODE_URLS = {
  [CHAINS.BERACHAIN]: process.env.RPC_BERACHAIN_HTTP,
} as const;

export const ARCHIVE_ENDPOINTS: Partial<Record<CHAINS, string>> = {
  [CHAINS.BERACHAIN]:
    "https://v2.archive.subsquid.io/network/berachain-mainnet",
} as const;
