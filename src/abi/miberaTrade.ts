import type {
  EventParams as EParams,
  FunctionArguments,
  FunctionReturn,
} from "@subsquid/evm-abi";
import { ContractBase, event, fun, indexed, viewFun } from "@subsquid/evm-abi";
import * as p from "@subsquid/evm-codec";

export const events = {
  Initialized: event(
    "0xc7f505b2f371ae2175ee4913f4499e1f2633a7b5936321eed1cdaeb6115181d2",
    "Initialized(uint64)",
    { version: p.uint64 }
  ),
  OwnershipTransferred: event(
    "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0",
    "OwnershipTransferred(address,address)",
    { previousOwner: indexed(p.address), newOwner: indexed(p.address) }
  ),
  TradeAccepted: event(
    "0xf5855f63ca1a28e196b9233ebd3040eb66bf463df102b4f1593a791c034ab0b5",
    "TradeAccepted(address,uint256,uint256,address)",
    {
      acceptor: indexed(p.address),
      offeredTokenId: indexed(p.uint256),
      requestedTokenId: indexed(p.uint256),
      originalProposer: p.address,
    }
  ),
  TradeCancelled: event(
    "0xd5ae19681cdef5df0cdaf6d57128843c7725d3e708ceebecacc944198d9bdb4b",
    "TradeCancelled(address,uint256,uint256)",
    {
      canceller: indexed(p.address),
      offeredTokenId: indexed(p.uint256),
      requestedTokenId: indexed(p.uint256),
    }
  ),
  TradeProposed: event(
    "0x1ee2f9e574db8d59effe4d95961997684b9c6ab5164dcef47a8f001184ef728c",
    "TradeProposed(address,uint256,uint256,uint256)",
    {
      proposer: indexed(p.address),
      offeredTokenId: indexed(p.uint256),
      requestedTokenId: indexed(p.uint256),
      timestamp: p.uint256,
    }
  ),
  Upgraded: event(
    "0xbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b",
    "Upgraded(address)",
    { implementation: indexed(p.address) }
  ),
};

export const functions = {
  UPGRADE_INTERFACE_VERSION: viewFun(
    "0xad3cb1cc",
    "UPGRADE_INTERFACE_VERSION()",
    {},
    p.string
  ),
  acceptTrade: fun("0xecb9fec3", "acceptTrade(uint256)", {
    offeredTokenId: p.uint256,
  }),
  cancelTrade: fun("0x09ec6cc7", "cancelTrade(uint256)", {
    offeredTokenId: p.uint256,
  }),
  initialize: fun("0x485cc955", "initialize(address,address)", {
    _owner: p.address,
    _mibera: p.address,
  }),
  mibera: viewFun("0x24f94a60", "mibera()", {}, p.address),
  owner: viewFun("0x8da5cb5b", "owner()", {}, p.address),
  proposeTrade: fun("0xcbeb9b9b", "proposeTrade(uint256,uint256)", {
    offeredTokenId: p.uint256,
    requestedTokenId: p.uint256,
  }),
  proxiableUUID: viewFun("0x52d1902d", "proxiableUUID()", {}, p.bytes32),
  renounceOwnership: fun("0x715018a6", "renounceOwnership()", {}),
  trades: viewFun(
    "0x1e6c598e",
    "trades(uint256)",
    { offeredTokenId: p.uint256 },
    { requestedTokenId: p.uint128, startedAt: p.uint128 }
  ),
  transferOwnership: fun("0xf2fde38b", "transferOwnership(address)", {
    newOwner: p.address,
  }),
  upgradeToAndCall: fun("0x4f1ef286", "upgradeToAndCall(address,bytes)", {
    newImplementation: p.address,
    data: p.bytes,
  }),
};

export class Contract extends ContractBase {
  UPGRADE_INTERFACE_VERSION() {
    return this.eth_call(functions.UPGRADE_INTERFACE_VERSION, {});
  }

  mibera() {
    return this.eth_call(functions.mibera, {});
  }

  owner() {
    return this.eth_call(functions.owner, {});
  }

  proxiableUUID() {
    return this.eth_call(functions.proxiableUUID, {});
  }

  trades(offeredTokenId: TradesParams["offeredTokenId"]) {
    return this.eth_call(functions.trades, { offeredTokenId });
  }
}

/// Event types
export type InitializedEventArgs = EParams<typeof events.Initialized>;
export type OwnershipTransferredEventArgs = EParams<
  typeof events.OwnershipTransferred
>;
export type TradeAcceptedEventArgs = EParams<typeof events.TradeAccepted>;
export type TradeCancelledEventArgs = EParams<typeof events.TradeCancelled>;
export type TradeProposedEventArgs = EParams<typeof events.TradeProposed>;
export type UpgradedEventArgs = EParams<typeof events.Upgraded>;

/// Function types
export type UPGRADE_INTERFACE_VERSIONParams = FunctionArguments<
  typeof functions.UPGRADE_INTERFACE_VERSION
>;
export type UPGRADE_INTERFACE_VERSIONReturn = FunctionReturn<
  typeof functions.UPGRADE_INTERFACE_VERSION
>;

export type AcceptTradeParams = FunctionArguments<typeof functions.acceptTrade>;
export type AcceptTradeReturn = FunctionReturn<typeof functions.acceptTrade>;

export type CancelTradeParams = FunctionArguments<typeof functions.cancelTrade>;
export type CancelTradeReturn = FunctionReturn<typeof functions.cancelTrade>;

export type InitializeParams = FunctionArguments<typeof functions.initialize>;
export type InitializeReturn = FunctionReturn<typeof functions.initialize>;

export type MiberaParams = FunctionArguments<typeof functions.mibera>;
export type MiberaReturn = FunctionReturn<typeof functions.mibera>;

export type OwnerParams = FunctionArguments<typeof functions.owner>;
export type OwnerReturn = FunctionReturn<typeof functions.owner>;

export type ProposeTradeParams = FunctionArguments<
  typeof functions.proposeTrade
>;
export type ProposeTradeReturn = FunctionReturn<typeof functions.proposeTrade>;

export type ProxiableUUIDParams = FunctionArguments<
  typeof functions.proxiableUUID
>;
export type ProxiableUUIDReturn = FunctionReturn<
  typeof functions.proxiableUUID
>;

export type RenounceOwnershipParams = FunctionArguments<
  typeof functions.renounceOwnership
>;
export type RenounceOwnershipReturn = FunctionReturn<
  typeof functions.renounceOwnership
>;

export type TradesParams = FunctionArguments<typeof functions.trades>;
export type TradesReturn = FunctionReturn<typeof functions.trades>;

export type TransferOwnershipParams = FunctionArguments<
  typeof functions.transferOwnership
>;
export type TransferOwnershipReturn = FunctionReturn<
  typeof functions.transferOwnership
>;

export type UpgradeToAndCallParams = FunctionArguments<
  typeof functions.upgradeToAndCall
>;
export type UpgradeToAndCallReturn = FunctionReturn<
  typeof functions.upgradeToAndCall
>;
