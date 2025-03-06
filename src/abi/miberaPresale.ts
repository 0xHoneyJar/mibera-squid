import * as p from '@subsquid/evm-codec'
import { event, fun, viewFun, indexed, ContractBase } from '@subsquid/evm-abi'
import type { EventParams as EParams, FunctionArguments, FunctionReturn } from '@subsquid/evm-abi'

export const events = {
    OwnershipHandoverCanceled: event("0xfa7b8eab7da67f412cc9575ed43464468f9bfbae89d1675917346ca6d8fe3c92", "OwnershipHandoverCanceled(address)", {"pendingOwner": indexed(p.address)}),
    OwnershipHandoverRequested: event("0xdbf36a107da19e49527a7176a1babf963b4b0ff8cde35ee35d6cd8f1f9ac7e1d", "OwnershipHandoverRequested(address)", {"pendingOwner": indexed(p.address)}),
    OwnershipTransferred: event("0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0", "OwnershipTransferred(address,address)", {"oldOwner": indexed(p.address), "newOwner": indexed(p.address)}),
    Participated: event("0xbfe142be8d62c9f4b8867c2fb8a74f5db596e853095acccbcd78c1d904b27efb", "Participated(uint256,address,uint256)", {"phase": indexed(p.uint256), "user": indexed(p.address), "amount": p.uint256}),
    Refunded: event("0x7ca5472b7ea78c2c0141c5a12ee6d170cf4ce8ed06be3d22c8252ddfc7a6a2c4", "Refunded(uint256,address,uint256)", {"phase": indexed(p.uint256), "user": indexed(p.address), "amount": p.uint256}),
}

export const functions = {
    CURRENT_PHASE: viewFun("0x8c5f1e3e", "CURRENT_PHASE()", {}, p.uint256),
    cancelOwnershipHandover: fun("0x54d1f13d", "cancelOwnershipHandover()", {}, ),
    completeOwnershipHandover: fun("0xf04e283e", "completeOwnershipHandover(address)", {"pendingOwner": p.address}, ),
    isClaimed: viewFun("0xf364c90c", "isClaimed(uint256,uint256)", {"_phase": p.uint256, "_index": p.uint256}, p.bool),
    isRefundClaimed: viewFun("0x33aecc7b", "isRefundClaimed(uint256,uint256)", {"_phase": p.uint256, "_index": p.uint256}, p.bool),
    owner: viewFun("0x8da5cb5b", "owner()", {}, p.address),
    ownershipHandoverExpiresAt: viewFun("0xfee81cf4", "ownershipHandoverExpiresAt(address)", {"pendingOwner": p.address}, p.uint256),
    participate: fun("0x9c4197f3", "participate(uint256,bytes32[])", {"_index": p.uint256, "_proof": p.array(p.bytes32)}, ),
    phaseToMerkleRoot: viewFun("0x4f3eeacc", "phaseToMerkleRoot(uint256)", {"phase": p.uint256}, p.bytes32),
    phaseToRefundRoot: viewFun("0xc0fe65b7", "phaseToRefundRoot(uint256)", {"phase": p.uint256}, p.bytes32),
    priceInBERA: viewFun("0x8ae527e8", "priceInBERA()", {}, p.uint256),
    refund: fun("0xbe703152", "refund(uint256,uint256,uint256,bytes32[])", {"_phase": p.uint256, "_index": p.uint256, "_amount": p.uint256, "_proof": p.array(p.bytes32)}, ),
    renounceOwnership: fun("0x715018a6", "renounceOwnership()", {}, ),
    requestOwnershipHandover: fun("0x25692962", "requestOwnershipHandover()", {}, ),
    setCurrentPhase: fun("0x7d3e1ee4", "setCurrentPhase(uint256)", {"_currentPhase": p.uint256}, ),
    setMerkleRoot: fun("0x18712c21", "setMerkleRoot(uint256,bytes32)", {"_phase": p.uint256, "_merkleRoot": p.bytes32}, ),
    setPriceInBERA: fun("0x253b1241", "setPriceInBERA(uint256)", {"_priceInBERA": p.uint256}, ),
    setRefundRoot: fun("0x3030ff8b", "setRefundRoot(uint256,bytes32)", {"_phase": p.uint256, "_refundRoot": p.bytes32}, ),
    transferOwnership: fun("0xf2fde38b", "transferOwnership(address)", {"newOwner": p.address}, ),
    withdraw: fun("0x51cff8d9", "withdraw(address)", {"_to": p.address}, ),
}

export class Contract extends ContractBase {

    CURRENT_PHASE() {
        return this.eth_call(functions.CURRENT_PHASE, {})
    }

    isClaimed(_phase: IsClaimedParams["_phase"], _index: IsClaimedParams["_index"]) {
        return this.eth_call(functions.isClaimed, {_phase, _index})
    }

    isRefundClaimed(_phase: IsRefundClaimedParams["_phase"], _index: IsRefundClaimedParams["_index"]) {
        return this.eth_call(functions.isRefundClaimed, {_phase, _index})
    }

    owner() {
        return this.eth_call(functions.owner, {})
    }

    ownershipHandoverExpiresAt(pendingOwner: OwnershipHandoverExpiresAtParams["pendingOwner"]) {
        return this.eth_call(functions.ownershipHandoverExpiresAt, {pendingOwner})
    }

    phaseToMerkleRoot(phase: PhaseToMerkleRootParams["phase"]) {
        return this.eth_call(functions.phaseToMerkleRoot, {phase})
    }

    phaseToRefundRoot(phase: PhaseToRefundRootParams["phase"]) {
        return this.eth_call(functions.phaseToRefundRoot, {phase})
    }

    priceInBERA() {
        return this.eth_call(functions.priceInBERA, {})
    }
}

/// Event types
export type OwnershipHandoverCanceledEventArgs = EParams<typeof events.OwnershipHandoverCanceled>
export type OwnershipHandoverRequestedEventArgs = EParams<typeof events.OwnershipHandoverRequested>
export type OwnershipTransferredEventArgs = EParams<typeof events.OwnershipTransferred>
export type ParticipatedEventArgs = EParams<typeof events.Participated>
export type RefundedEventArgs = EParams<typeof events.Refunded>

/// Function types
export type CURRENT_PHASEParams = FunctionArguments<typeof functions.CURRENT_PHASE>
export type CURRENT_PHASEReturn = FunctionReturn<typeof functions.CURRENT_PHASE>

export type CancelOwnershipHandoverParams = FunctionArguments<typeof functions.cancelOwnershipHandover>
export type CancelOwnershipHandoverReturn = FunctionReturn<typeof functions.cancelOwnershipHandover>

export type CompleteOwnershipHandoverParams = FunctionArguments<typeof functions.completeOwnershipHandover>
export type CompleteOwnershipHandoverReturn = FunctionReturn<typeof functions.completeOwnershipHandover>

export type IsClaimedParams = FunctionArguments<typeof functions.isClaimed>
export type IsClaimedReturn = FunctionReturn<typeof functions.isClaimed>

export type IsRefundClaimedParams = FunctionArguments<typeof functions.isRefundClaimed>
export type IsRefundClaimedReturn = FunctionReturn<typeof functions.isRefundClaimed>

export type OwnerParams = FunctionArguments<typeof functions.owner>
export type OwnerReturn = FunctionReturn<typeof functions.owner>

export type OwnershipHandoverExpiresAtParams = FunctionArguments<typeof functions.ownershipHandoverExpiresAt>
export type OwnershipHandoverExpiresAtReturn = FunctionReturn<typeof functions.ownershipHandoverExpiresAt>

export type ParticipateParams = FunctionArguments<typeof functions.participate>
export type ParticipateReturn = FunctionReturn<typeof functions.participate>

export type PhaseToMerkleRootParams = FunctionArguments<typeof functions.phaseToMerkleRoot>
export type PhaseToMerkleRootReturn = FunctionReturn<typeof functions.phaseToMerkleRoot>

export type PhaseToRefundRootParams = FunctionArguments<typeof functions.phaseToRefundRoot>
export type PhaseToRefundRootReturn = FunctionReturn<typeof functions.phaseToRefundRoot>

export type PriceInBERAParams = FunctionArguments<typeof functions.priceInBERA>
export type PriceInBERAReturn = FunctionReturn<typeof functions.priceInBERA>

export type RefundParams = FunctionArguments<typeof functions.refund>
export type RefundReturn = FunctionReturn<typeof functions.refund>

export type RenounceOwnershipParams = FunctionArguments<typeof functions.renounceOwnership>
export type RenounceOwnershipReturn = FunctionReturn<typeof functions.renounceOwnership>

export type RequestOwnershipHandoverParams = FunctionArguments<typeof functions.requestOwnershipHandover>
export type RequestOwnershipHandoverReturn = FunctionReturn<typeof functions.requestOwnershipHandover>

export type SetCurrentPhaseParams = FunctionArguments<typeof functions.setCurrentPhase>
export type SetCurrentPhaseReturn = FunctionReturn<typeof functions.setCurrentPhase>

export type SetMerkleRootParams = FunctionArguments<typeof functions.setMerkleRoot>
export type SetMerkleRootReturn = FunctionReturn<typeof functions.setMerkleRoot>

export type SetPriceInBERAParams = FunctionArguments<typeof functions.setPriceInBERA>
export type SetPriceInBERAReturn = FunctionReturn<typeof functions.setPriceInBERA>

export type SetRefundRootParams = FunctionArguments<typeof functions.setRefundRoot>
export type SetRefundRootReturn = FunctionReturn<typeof functions.setRefundRoot>

export type TransferOwnershipParams = FunctionArguments<typeof functions.transferOwnership>
export type TransferOwnershipReturn = FunctionReturn<typeof functions.transferOwnership>

export type WithdrawParams = FunctionArguments<typeof functions.withdraw>
export type WithdrawReturn = FunctionReturn<typeof functions.withdraw>

