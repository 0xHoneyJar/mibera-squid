export enum ContractType {
  Treasury = "Treasury",
  Presale = "Presale",
  Candies = "Candies",
  VendingMachine = "VendingMachine",
  FractureV1 = "FractureV1",
  FractureV2 = "FractureV2",
  FractureV3 = "FractureV3",
  FractureV4 = "FractureV4",
  FractureV5 = "FractureV5",
  FractureV6 = "FractureV6",
  FractureV7 = "FractureV7",
  Seaport = "Seaport",
  MiberaTrade = "MiberaTrade",
}

export enum CHAINS {
  BERACHAIN = "berachain",
}

export const CHAIN_START_BLOCK = {
  [CHAINS.BERACHAIN]: 1953786,
} as const;

export const CONTRACTS: {
  [key in ContractType]?: {
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
    address: "0x...", // You'll need to fill in the actual address
    network: CHAINS.BERACHAIN,
    startBlock: 0, // You'll need to fill in the actual start block
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
  [ContractType.FractureV4]: {
    address: "0x72DB992E18a1bf38111B1936DD723E82D0D96313",
    network: CHAINS.BERACHAIN,
    startBlock: 3837808,
  },
  [ContractType.FractureV5]: {
    address: "0x3A00301B713be83EC54B7B4Fb0f86397d087E6d3",
    network: CHAINS.BERACHAIN,
    startBlock: 3837808,
  },
  [ContractType.FractureV6]: {
    address: "0x419F25C4f9A9c730AAcf58b8401B5b3e566Fe886",
    network: CHAINS.BERACHAIN,
    startBlock: 3837808,
  },
  [ContractType.FractureV7]: {
    address: "0x81A27117bd894942BA6737402fB9e57e942C6058",
    network: CHAINS.BERACHAIN,
    startBlock: 3837808,
  },
  [ContractType.Seaport]: {
    address: "0x0000000000000068F116a894984e2DB1123eB395",
    network: CHAINS.BERACHAIN,
    startBlock: 3837808,
  },
  [ContractType.MiberaTrade]: {
    address: "0x90485B61C9dA51A3c79fca1277899d9CD5D350c2",
    network: CHAINS.BERACHAIN,
    startBlock: 3837808,
  },
} as const;

export const CHAIN_NODE_URLS = {
  [CHAINS.BERACHAIN]: process.env.RPC_BERACHAIN_HTTP,
} as const;

export const ARCHIVE_ENDPOINTS: Partial<Record<CHAINS, string>> = {
  [CHAINS.BERACHAIN]:
    "https://v2.archive.subsquid.io/network/berachain-mainnet",
} as const;
