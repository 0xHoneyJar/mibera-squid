export enum ContractType {
  Treasury = "Treasury",
  Presale = "Presale",
  Candies = "Candies",
  VendingMachine = "VendingMachine",
  FractureV1 = "FractureV1",
  FractureV2 = "FractureV2",
  FractureV3 = "FractureV3",
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
  [ContractType.Presale]: {
    address: "0xdd5F6f41B250644E5678D77654309a5b6A5f4D55",
    network: CHAINS.BERACHAIN,
    startBlock: 2731326,
  },
  [ContractType.Candies]: {
    address: "0xecA03517c5195F1edD634DA6D690D6c72407c40c",
    network: CHAINS.BERACHAIN,
    startBlock: 2688877,
  },
  [ContractType.VendingMachine]: {
    address: "0x048327A187b944ddac61c6e202BfccD20d17c008",
    network: CHAINS.BERACHAIN,
    startBlock: 4130866,
  },
  [ContractType.FractureV1]: {
    address: "0x86Db98cf1b81E833447b12a077ac28c36b75c8E1",
    network: CHAINS.BERACHAIN,
    startBlock: 4029732,
  },
  [ContractType.FractureV2]: {
    address: "0x8D4972bd5D2df474e71da6676a365fB549853991",
    network: CHAINS.BERACHAIN,
    startBlock: 4029732,
  },
  [ContractType.FractureV3]: {
    address: "0x144B27b1A267eE71989664b3907030Da84cc4754",
    network: CHAINS.BERACHAIN,
    startBlock: 4029732,
  },
} as const;

export const CHAIN_NODE_URLS = {
  [CHAINS.BERACHAIN]: process.env.RPC_BERACHAIN_HTTP,
} as const;

export const ARCHIVE_ENDPOINTS: Partial<Record<CHAINS, string>> = {
  [CHAINS.BERACHAIN]:
    "https://v2.archive.subsquid.io/network/berachain-mainnet",
} as const;
