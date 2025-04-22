import * as p from '@subsquid/evm-codec'
import { event, fun, viewFun, indexed, ContractBase } from '@subsquid/evm-abi'
import type { EventParams as EParams, FunctionArguments, FunctionReturn } from '@subsquid/evm-abi'

export const events = {
    BackingAdded: event("0xb14ac547961ad218e3240d8c49c21699914ca33bb6320d4f04f5b8e3c38b2435", "BackingAdded(uint256,uint256)", {"backingAdded": p.uint256, "newTotalBacking": p.uint256}),
    BackingLoanExpired: event("0xb48134fe0eed35b1df75b4a0efd22cb7e63e0eddcd8f507dac03f708b772ef51", "BackingLoanExpired(uint256,uint256)", {"loanId": p.uint256, "newTotalBacking": p.uint256}),
    BackingLoanPayedBack: event("0xffec0aa0d99176f33d39fe7c559b8b7ba66a711b085f41b1bff822b2b4b9534e", "BackingLoanPayedBack(uint256,uint256)", {"loanId": p.uint256, "newTotalBacking": p.uint256}),
    ItemLoanExpired: event("0xfb6bcaabcd69983c1cb2aafde251ef3771f4f7304d631657cecf54a504a5bbcc", "ItemLoanExpired(uint256,uint256)", {"loanId": p.uint256, "newTotalBacking": p.uint256}),
    ItemLoaned: event("0x5f9fc3b6724eaf6e1d678aa59735eb5dca41b0c46566d1d80a39ef257cecbfab", "ItemLoaned(uint256,uint256,uint256)", {"loanId": p.uint256, "itemId": p.uint256, "expiry": p.uint256}),
    ItemPurchased: event("0x82979ce06c1fcf7a090707d8fc7123bfa6b69ba161402b0d6c52e052bd97d04b", "ItemPurchased(uint256,uint256)", {"itemId": p.uint256, "newTotalBacking": p.uint256}),
    ItemRedeemed: event("0xba67a4588a1e4022f582e72664173f041eca52d2e23f10c660c23de58aa952a4", "ItemRedeemed(uint256,uint256)", {"itemId": p.uint256, "newTotalBacking": p.uint256}),
    LoanItemSentBack: event("0xd61b4444fea8d2e412b33dd81153346b9e37988a63f55768da92a5dd9e62bbdd", "LoanItemSentBack(uint256,uint256)", {"loanId": p.uint256, "newTotalBacking": p.uint256}),
    LoanReceived: event("0xe13fe65264cda10c4019015ca6a4ce84737d5eefc23fb7f64a0db2129de8d619", "LoanReceived(uint256,uint256[],uint256,uint256)", {"loanId": p.uint256, "ids": p.array(p.uint256), "amount": p.uint256, "expiry": p.uint256}),
    OwnershipTransferStarted: event("0x38d16b8cac22d99fc7c124b9cd0de2d3fa1faef420bfe791d8c362d765e22700", "OwnershipTransferStarted(address,address)", {"previousOwner": indexed(p.address), "newOwner": indexed(p.address)}),
    OwnershipTransferred: event("0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0", "OwnershipTransferred(address,address)", {"previousOwner": indexed(p.address), "newOwner": indexed(p.address)}),
    RFVChanged: event("0x5c7deee524a744c0cd3c35815dd464867e8d316f081a13a9378d5192cdc56d4d", "RFVChanged(uint256)", {"newRFV": indexed(p.uint256)}),
    TermLimitSet: event("0xa085034933f3e07d30f2c527aeff4cba78d6b74c2fa1a91fafdd7b50fd173709", "TermLimitSet(uint256,uint256)", {"oldTermLimit": p.uint256, "newTermLimit": p.uint256}),
}

export const functions = {
    BERA_MARKET_FEE_PERCENT: viewFun("0x8093e660", "BERA_MARKET_FEE_PERCENT()", {}, p.uint256),
    CREATOR_PERCENT: viewFun("0xb0468185", "CREATOR_PERCENT()", {}, p.uint256),
    INTEREST_RATE: viewFun("0x5b72a33a", "INTEREST_RATE()", {}, p.uint256),
    ROYALTY_PERCENT: viewFun("0xcdcd897e", "ROYALTY_PERCENT()", {}, p.uint256),
    acceptOwnership: fun("0x79ba5097", "acceptOwnership()", {}, ),
    addToBacking: fun("0x5e2efbe4", "addToBacking(uint256)", {"amount_": p.uint256}, ),
    backing: viewFun("0xc9503fe2", "backing()", {}, p.uint256),
    backingLoanDetails: viewFun("0x2b149796", "backingLoanDetails(uint256)", {"id": p.uint256}, {"loanedTo": p.address, "timestampDue": p.uint256, "interestOwed": p.uint256, "backingOwed": p.uint256, "defaultCreatorFee": p.uint256}),
    backingLoanExpired: fun("0x9963fbc2", "backingLoanExpired(uint256)", {"loanId_": p.uint256}, ),
    backingLoanId: viewFun("0xfea8f23d", "backingLoanId()", {}, p.uint256),
    backingLoanedOut: viewFun("0xc140cdd4", "backingLoanedOut()", {}, p.uint256),
    collateralHeld: viewFun("0x2eff30dd", "collateralHeld()", {}, p.uint256),
    feesToWithdraw: viewFun("0x449757e9", "feesToWithdraw()", {}, p.uint256),
    float: viewFun("0x68ccaa52", "float()", {}, p.uint256),
    itemLoanDetails: viewFun("0x290e8441", "itemLoanDetails(uint256)", {"id": p.uint256}, {"id": p.uint256, "timestampDue": p.uint256, "collateralGiven": p.uint256, "paidBackCreatorFee": p.uint256, "defaultCreatorFee": p.uint256}),
    itemLoanExpired: fun("0xd09f12a8", "itemLoanExpired(uint256)", {"loanId_": p.uint256}, ),
    itemLoanId: viewFun("0xfa10761e", "itemLoanId()", {}, p.uint256),
    itemLoaned: viewFun("0xcce7223e", "itemLoaned(uint256)", {"id": p.uint256}, p.bool),
    itemsTreasuryOwns: viewFun("0x3ace132f", "itemsTreasuryOwns()", {}, p.uint256),
    loanItem: fun("0x06486740", "loanItem(uint256,uint256)", {"id_": p.uint256, "duration_": p.uint256}, ),
    loanOnItem: viewFun("0x25f17bea", "loanOnItem(uint256)", {"id": p.uint256}, p.bool),
    noFloatValue: viewFun("0x67323574", "noFloatValue()", {}, p.uint256),
    owner: viewFun("0x8da5cb5b", "owner()", {}, p.address),
    payLoanBack: fun("0x2344cdb8", "payLoanBack(uint256,uint256)", {"loanId_": p.uint256, "amount_": p.uint256}, ),
    pendingOwner: viewFun("0xe30c3978", "pendingOwner()", {}, p.address),
    purchaseItem: fun("0xd38ea5bf", "purchaseItem(uint256)", {"id_": p.uint256}, ),
    realFloorValue: viewFun("0x3979d343", "realFloorValue()", {}, p.uint256),
    receiveLoan: fun("0x2fe72884", "receiveLoan(uint256[],uint256,uint256)", {"id_": p.array(p.uint256), "amount_": p.uint256, "duration_": p.uint256}, ),
    redeemItem: fun("0x1c26dc23", "redeemItem(uint256)", {"id_": p.uint256}, ),
    renounceOwnership: fun("0x715018a6", "renounceOwnership()", {}, ),
    sendLoanedItemBack: fun("0x3580bf68", "sendLoanedItemBack(uint256)", {"loanId_": p.uint256}, ),
    setCollection: fun("0x768b5fd5", "setCollection(address)", {"collection_": p.address}, ),
    setNoFloatValue: fun("0x19376fc8", "setNoFloatValue(uint256)", {"value_": p.uint256}, ),
    setTermLimit: fun("0x6f01e2bb", "setTermLimit(uint256)", {"termLimit_": p.uint256}, ),
    termLimit: viewFun("0x73023f19", "termLimit()", {}, p.uint256),
    transferOwnership: fun("0xf2fde38b", "transferOwnership(address)", {"newOwner": p.address}, ),
    treasuryOwned: viewFun("0xddb3e096", "treasuryOwned(uint256)", {"id": p.uint256}, p.bool),
    withdrawFees: fun("0x476343ee", "withdrawFees()", {}, ),
}

export class Contract extends ContractBase {

    BERA_MARKET_FEE_PERCENT() {
        return this.eth_call(functions.BERA_MARKET_FEE_PERCENT, {})
    }

    CREATOR_PERCENT() {
        return this.eth_call(functions.CREATOR_PERCENT, {})
    }

    INTEREST_RATE() {
        return this.eth_call(functions.INTEREST_RATE, {})
    }

    ROYALTY_PERCENT() {
        return this.eth_call(functions.ROYALTY_PERCENT, {})
    }

    backing() {
        return this.eth_call(functions.backing, {})
    }

    backingLoanDetails(id: BackingLoanDetailsParams["id"]) {
        return this.eth_call(functions.backingLoanDetails, {id})
    }

    backingLoanId() {
        return this.eth_call(functions.backingLoanId, {})
    }

    backingLoanedOut() {
        return this.eth_call(functions.backingLoanedOut, {})
    }

    collateralHeld() {
        return this.eth_call(functions.collateralHeld, {})
    }

    feesToWithdraw() {
        return this.eth_call(functions.feesToWithdraw, {})
    }

    float() {
        return this.eth_call(functions.float, {})
    }

    itemLoanDetails(id: ItemLoanDetailsParams["id"]) {
        return this.eth_call(functions.itemLoanDetails, {id})
    }

    itemLoanId() {
        return this.eth_call(functions.itemLoanId, {})
    }

    itemLoaned(id: ItemLoanedParams["id"]) {
        return this.eth_call(functions.itemLoaned, {id})
    }

    itemsTreasuryOwns() {
        return this.eth_call(functions.itemsTreasuryOwns, {})
    }

    loanOnItem(id: LoanOnItemParams["id"]) {
        return this.eth_call(functions.loanOnItem, {id})
    }

    noFloatValue() {
        return this.eth_call(functions.noFloatValue, {})
    }

    owner() {
        return this.eth_call(functions.owner, {})
    }

    pendingOwner() {
        return this.eth_call(functions.pendingOwner, {})
    }

    realFloorValue() {
        return this.eth_call(functions.realFloorValue, {})
    }

    termLimit() {
        return this.eth_call(functions.termLimit, {})
    }

    treasuryOwned(id: TreasuryOwnedParams["id"]) {
        return this.eth_call(functions.treasuryOwned, {id})
    }
}

/// Event types
export type BackingAddedEventArgs = EParams<typeof events.BackingAdded>
export type BackingLoanExpiredEventArgs = EParams<typeof events.BackingLoanExpired>
export type BackingLoanPayedBackEventArgs = EParams<typeof events.BackingLoanPayedBack>
export type ItemLoanExpiredEventArgs = EParams<typeof events.ItemLoanExpired>
export type ItemLoanedEventArgs = EParams<typeof events.ItemLoaned>
export type ItemPurchasedEventArgs = EParams<typeof events.ItemPurchased>
export type ItemRedeemedEventArgs = EParams<typeof events.ItemRedeemed>
export type LoanItemSentBackEventArgs = EParams<typeof events.LoanItemSentBack>
export type LoanReceivedEventArgs = EParams<typeof events.LoanReceived>
export type OwnershipTransferStartedEventArgs = EParams<typeof events.OwnershipTransferStarted>
export type OwnershipTransferredEventArgs = EParams<typeof events.OwnershipTransferred>
export type RFVChangedEventArgs = EParams<typeof events.RFVChanged>
export type TermLimitSetEventArgs = EParams<typeof events.TermLimitSet>

/// Function types
export type BERA_MARKET_FEE_PERCENTParams = FunctionArguments<typeof functions.BERA_MARKET_FEE_PERCENT>
export type BERA_MARKET_FEE_PERCENTReturn = FunctionReturn<typeof functions.BERA_MARKET_FEE_PERCENT>

export type CREATOR_PERCENTParams = FunctionArguments<typeof functions.CREATOR_PERCENT>
export type CREATOR_PERCENTReturn = FunctionReturn<typeof functions.CREATOR_PERCENT>

export type INTEREST_RATEParams = FunctionArguments<typeof functions.INTEREST_RATE>
export type INTEREST_RATEReturn = FunctionReturn<typeof functions.INTEREST_RATE>

export type ROYALTY_PERCENTParams = FunctionArguments<typeof functions.ROYALTY_PERCENT>
export type ROYALTY_PERCENTReturn = FunctionReturn<typeof functions.ROYALTY_PERCENT>

export type AcceptOwnershipParams = FunctionArguments<typeof functions.acceptOwnership>
export type AcceptOwnershipReturn = FunctionReturn<typeof functions.acceptOwnership>

export type AddToBackingParams = FunctionArguments<typeof functions.addToBacking>
export type AddToBackingReturn = FunctionReturn<typeof functions.addToBacking>

export type BackingParams = FunctionArguments<typeof functions.backing>
export type BackingReturn = FunctionReturn<typeof functions.backing>

export type BackingLoanDetailsParams = FunctionArguments<typeof functions.backingLoanDetails>
export type BackingLoanDetailsReturn = FunctionReturn<typeof functions.backingLoanDetails>

export type BackingLoanExpiredParams = FunctionArguments<typeof functions.backingLoanExpired>
export type BackingLoanExpiredReturn = FunctionReturn<typeof functions.backingLoanExpired>

export type BackingLoanIdParams = FunctionArguments<typeof functions.backingLoanId>
export type BackingLoanIdReturn = FunctionReturn<typeof functions.backingLoanId>

export type BackingLoanedOutParams = FunctionArguments<typeof functions.backingLoanedOut>
export type BackingLoanedOutReturn = FunctionReturn<typeof functions.backingLoanedOut>

export type CollateralHeldParams = FunctionArguments<typeof functions.collateralHeld>
export type CollateralHeldReturn = FunctionReturn<typeof functions.collateralHeld>

export type FeesToWithdrawParams = FunctionArguments<typeof functions.feesToWithdraw>
export type FeesToWithdrawReturn = FunctionReturn<typeof functions.feesToWithdraw>

export type FloatParams = FunctionArguments<typeof functions.float>
export type FloatReturn = FunctionReturn<typeof functions.float>

export type ItemLoanDetailsParams = FunctionArguments<typeof functions.itemLoanDetails>
export type ItemLoanDetailsReturn = FunctionReturn<typeof functions.itemLoanDetails>

export type ItemLoanExpiredParams = FunctionArguments<typeof functions.itemLoanExpired>
export type ItemLoanExpiredReturn = FunctionReturn<typeof functions.itemLoanExpired>

export type ItemLoanIdParams = FunctionArguments<typeof functions.itemLoanId>
export type ItemLoanIdReturn = FunctionReturn<typeof functions.itemLoanId>

export type ItemLoanedParams = FunctionArguments<typeof functions.itemLoaned>
export type ItemLoanedReturn = FunctionReturn<typeof functions.itemLoaned>

export type ItemsTreasuryOwnsParams = FunctionArguments<typeof functions.itemsTreasuryOwns>
export type ItemsTreasuryOwnsReturn = FunctionReturn<typeof functions.itemsTreasuryOwns>

export type LoanItemParams = FunctionArguments<typeof functions.loanItem>
export type LoanItemReturn = FunctionReturn<typeof functions.loanItem>

export type LoanOnItemParams = FunctionArguments<typeof functions.loanOnItem>
export type LoanOnItemReturn = FunctionReturn<typeof functions.loanOnItem>

export type NoFloatValueParams = FunctionArguments<typeof functions.noFloatValue>
export type NoFloatValueReturn = FunctionReturn<typeof functions.noFloatValue>

export type OwnerParams = FunctionArguments<typeof functions.owner>
export type OwnerReturn = FunctionReturn<typeof functions.owner>

export type PayLoanBackParams = FunctionArguments<typeof functions.payLoanBack>
export type PayLoanBackReturn = FunctionReturn<typeof functions.payLoanBack>

export type PendingOwnerParams = FunctionArguments<typeof functions.pendingOwner>
export type PendingOwnerReturn = FunctionReturn<typeof functions.pendingOwner>

export type PurchaseItemParams = FunctionArguments<typeof functions.purchaseItem>
export type PurchaseItemReturn = FunctionReturn<typeof functions.purchaseItem>

export type RealFloorValueParams = FunctionArguments<typeof functions.realFloorValue>
export type RealFloorValueReturn = FunctionReturn<typeof functions.realFloorValue>

export type ReceiveLoanParams = FunctionArguments<typeof functions.receiveLoan>
export type ReceiveLoanReturn = FunctionReturn<typeof functions.receiveLoan>

export type RedeemItemParams = FunctionArguments<typeof functions.redeemItem>
export type RedeemItemReturn = FunctionReturn<typeof functions.redeemItem>

export type RenounceOwnershipParams = FunctionArguments<typeof functions.renounceOwnership>
export type RenounceOwnershipReturn = FunctionReturn<typeof functions.renounceOwnership>

export type SendLoanedItemBackParams = FunctionArguments<typeof functions.sendLoanedItemBack>
export type SendLoanedItemBackReturn = FunctionReturn<typeof functions.sendLoanedItemBack>

export type SetCollectionParams = FunctionArguments<typeof functions.setCollection>
export type SetCollectionReturn = FunctionReturn<typeof functions.setCollection>

export type SetNoFloatValueParams = FunctionArguments<typeof functions.setNoFloatValue>
export type SetNoFloatValueReturn = FunctionReturn<typeof functions.setNoFloatValue>

export type SetTermLimitParams = FunctionArguments<typeof functions.setTermLimit>
export type SetTermLimitReturn = FunctionReturn<typeof functions.setTermLimit>

export type TermLimitParams = FunctionArguments<typeof functions.termLimit>
export type TermLimitReturn = FunctionReturn<typeof functions.termLimit>

export type TransferOwnershipParams = FunctionArguments<typeof functions.transferOwnership>
export type TransferOwnershipReturn = FunctionReturn<typeof functions.transferOwnership>

export type TreasuryOwnedParams = FunctionArguments<typeof functions.treasuryOwned>
export type TreasuryOwnedReturn = FunctionReturn<typeof functions.treasuryOwned>

export type WithdrawFeesParams = FunctionArguments<typeof functions.withdrawFees>
export type WithdrawFeesReturn = FunctionReturn<typeof functions.withdrawFees>

