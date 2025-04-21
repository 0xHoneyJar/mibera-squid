import * as p from '@subsquid/evm-codec'
import { event, fun, viewFun, indexed, ContractBase } from '@subsquid/evm-abi'
import type { EventParams as EParams, FunctionArguments, FunctionReturn } from '@subsquid/evm-abi'

export const events = {
    AuctionHouseSet: event("0x7fd3556cf1c3066b228fd2c7324f6cb06a835db738c5e61eaed02baf71a9c38e", "AuctionHouseSet(address,address)", {"oldAuctionHouse": p.address, "newAuctionHouse": p.address}),
    BackingAdded: event("0xb14ac547961ad218e3240d8c49c21699914ca33bb6320d4f04f5b8e3c38b2435", "BackingAdded(uint256,uint256)", {"backingAdded": p.uint256, "newTotalBacking": p.uint256}),
    BackingLoanExpired: event("0xb48134fe0eed35b1df75b4a0efd22cb7e63e0eddcd8f507dac03f708b772ef51", "BackingLoanExpired(uint256,uint256)", {"loanId": p.uint256, "newTotalBacking": p.uint256}),
    BackingLoanPayedBack: event("0xffec0aa0d99176f33d39fe7c559b8b7ba66a711b085f41b1bff822b2b4b9534e", "BackingLoanPayedBack(uint256,uint256)", {"loanId": p.uint256, "newTotalBacking": p.uint256}),
    ItemRedeemed: event("0xba67a4588a1e4022f582e72664173f041eca52d2e23f10c660c23de58aa952a4", "ItemRedeemed(uint256,uint256)", {"itemId": p.uint256, "newTotalBacking": p.uint256}),
    LoanReceived: event("0xe13fe65264cda10c4019015ca6a4ce84737d5eefc23fb7f64a0db2129de8d619", "LoanReceived(uint256,uint256[],uint256,uint256)", {"loanId": p.uint256, "ids": p.array(p.uint256), "amount": p.uint256, "expiry": p.uint256}),
    MinLoanDurationSet: event("0x59edc63fce3fa1125ac1ddd3144ae85d0a01d23b0ef6d1b5019c1fd0c42fa441", "MinLoanDurationSet(uint256,uint256)", {"oldMinLoanDuration": p.uint256, "newMinLoanDuration": p.uint256}),
    OwnershipTransferStarted: event("0x38d16b8cac22d99fc7c124b9cd0de2d3fa1faef420bfe791d8c362d765e22700", "OwnershipTransferStarted(address,address)", {"previousOwner": indexed(p.address), "newOwner": indexed(p.address)}),
    OwnershipTransferred: event("0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0", "OwnershipTransferred(address,address)", {"previousOwner": indexed(p.address), "newOwner": indexed(p.address)}),
    RFVChanged: event("0x5c7deee524a744c0cd3c35815dd464867e8d316f081a13a9378d5192cdc56d4d", "RFVChanged(uint256)", {"newRFV": indexed(p.uint256)}),
    RedemtionSet: event("0x2150b886f730919c7b4265dc756352f361dc3419078ccba5e57086125db2bd7f", "RedemtionSet(bool)", {"redemtionsOpen": p.bool}),
    TermLimitSet: event("0xa085034933f3e07d30f2c527aeff4cba78d6b74c2fa1a91fafdd7b50fd173709", "TermLimitSet(uint256,uint256)", {"oldTermLimit": p.uint256, "newTermLimit": p.uint256}),
}

export const functions = {
    BERA_MARKET_FEE_PERCENT: viewFun("0x8093e660", "BERA_MARKET_FEE_PERCENT()", {}, p.uint256),
    CREATOR_PERCENT: viewFun("0xb0468185", "CREATOR_PERCENT()", {}, p.uint256),
    INTEREST_RATE: viewFun("0x5b72a33a", "INTEREST_RATE()", {}, p.uint256),
    ROYALTY_PERCENT: viewFun("0xcdcd897e", "ROYALTY_PERCENT()", {}, p.uint256),
    WETH: viewFun("0xad5c4648", "WETH()", {}, p.address),
    acceptOwnership: fun("0x79ba5097", "acceptOwnership()", {}, ),
    addToBacking: fun("0x5e2efbe4", "addToBacking(uint256)", {"amount_": p.uint256}, ),
    auctionHouse: viewFun("0xed9152c8", "auctionHouse()", {}, p.address),
    backing: viewFun("0xc9503fe2", "backing()", {}, p.uint256),
    backingLoanDetails: viewFun("0x2b149796", "backingLoanDetails(uint256)", {"id": p.uint256}, {"loanedTo": p.address, "timestampDue": p.uint256, "interestOwed": p.uint256, "backingOwed": p.uint256, "defaultCreatorFee": p.uint256}),
    backingLoanExpired: fun("0x9963fbc2", "backingLoanExpired(uint256)", {"loanId_": p.uint256}, ),
    backingLoanId: viewFun("0xfea8f23d", "backingLoanId()", {}, p.uint256),
    backingLoanedOut: viewFun("0xc140cdd4", "backingLoanedOut()", {}, p.uint256),
    feesToWithdraw: viewFun("0x449757e9", "feesToWithdraw()", {}, p.uint256),
    float: viewFun("0x68ccaa52", "float()", {}, p.uint256),
    loanOnItem: viewFun("0x25f17bea", "loanOnItem(uint256)", {"id": p.uint256}, p.bool),
    minLoanDuration: viewFun("0x4522a06e", "minLoanDuration()", {}, p.uint256),
    owner: viewFun("0x8da5cb5b", "owner()", {}, p.address),
    payLoanBack: fun("0x2344cdb8", "payLoanBack(uint256,uint256)", {"loanId_": p.uint256, "amount_": p.uint256}, ),
    pendingOwner: viewFun("0xe30c3978", "pendingOwner()", {}, p.address),
    realFloorValue: viewFun("0x3979d343", "realFloorValue()", {}, p.uint256),
    receiveLoan: fun("0x2fe72884", "receiveLoan(uint256[],uint256,uint256)", {"id_": p.array(p.uint256), "amount_": p.uint256, "duration_": p.uint256}, ),
    redeemItem: fun("0x1c26dc23", "redeemItem(uint256)", {"id_": p.uint256}, p.uint256),
    redemtionsOpen: viewFun("0x2c6ec3b7", "redemtionsOpen()", {}, p.bool),
    renounceOwnership: fun("0x715018a6", "renounceOwnership()", {}, ),
    setAuctionHouse: fun("0xe76d8952", "setAuctionHouse(address)", {"auctionHouse_": p.address}, ),
    setMinLoanDuration: fun("0x1de09fee", "setMinLoanDuration(uint256)", {"minLoanDuration_": p.uint256}, ),
    setRedemtions: fun("0x6cb3c755", "setRedemtions(bool)", {"open_": p.bool}, ),
    setTermLimit: fun("0x6f01e2bb", "setTermLimit(uint256)", {"termLimit_": p.uint256}, ),
    termLimit: viewFun("0x73023f19", "termLimit()", {}, p.uint256),
    transferOwnership: fun("0xf2fde38b", "transferOwnership(address)", {"newOwner": p.address}, ),
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

    WETH() {
        return this.eth_call(functions.WETH, {})
    }

    auctionHouse() {
        return this.eth_call(functions.auctionHouse, {})
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

    feesToWithdraw() {
        return this.eth_call(functions.feesToWithdraw, {})
    }

    float() {
        return this.eth_call(functions.float, {})
    }

    loanOnItem(id: LoanOnItemParams["id"]) {
        return this.eth_call(functions.loanOnItem, {id})
    }

    minLoanDuration() {
        return this.eth_call(functions.minLoanDuration, {})
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

    redemtionsOpen() {
        return this.eth_call(functions.redemtionsOpen, {})
    }

    termLimit() {
        return this.eth_call(functions.termLimit, {})
    }
}

/// Event types
export type AuctionHouseSetEventArgs = EParams<typeof events.AuctionHouseSet>
export type BackingAddedEventArgs = EParams<typeof events.BackingAdded>
export type BackingLoanExpiredEventArgs = EParams<typeof events.BackingLoanExpired>
export type BackingLoanPayedBackEventArgs = EParams<typeof events.BackingLoanPayedBack>
export type ItemRedeemedEventArgs = EParams<typeof events.ItemRedeemed>
export type LoanReceivedEventArgs = EParams<typeof events.LoanReceived>
export type MinLoanDurationSetEventArgs = EParams<typeof events.MinLoanDurationSet>
export type OwnershipTransferStartedEventArgs = EParams<typeof events.OwnershipTransferStarted>
export type OwnershipTransferredEventArgs = EParams<typeof events.OwnershipTransferred>
export type RFVChangedEventArgs = EParams<typeof events.RFVChanged>
export type RedemtionSetEventArgs = EParams<typeof events.RedemtionSet>
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

export type WETHParams = FunctionArguments<typeof functions.WETH>
export type WETHReturn = FunctionReturn<typeof functions.WETH>

export type AcceptOwnershipParams = FunctionArguments<typeof functions.acceptOwnership>
export type AcceptOwnershipReturn = FunctionReturn<typeof functions.acceptOwnership>

export type AddToBackingParams = FunctionArguments<typeof functions.addToBacking>
export type AddToBackingReturn = FunctionReturn<typeof functions.addToBacking>

export type AuctionHouseParams = FunctionArguments<typeof functions.auctionHouse>
export type AuctionHouseReturn = FunctionReturn<typeof functions.auctionHouse>

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

export type FeesToWithdrawParams = FunctionArguments<typeof functions.feesToWithdraw>
export type FeesToWithdrawReturn = FunctionReturn<typeof functions.feesToWithdraw>

export type FloatParams = FunctionArguments<typeof functions.float>
export type FloatReturn = FunctionReturn<typeof functions.float>

export type LoanOnItemParams = FunctionArguments<typeof functions.loanOnItem>
export type LoanOnItemReturn = FunctionReturn<typeof functions.loanOnItem>

export type MinLoanDurationParams = FunctionArguments<typeof functions.minLoanDuration>
export type MinLoanDurationReturn = FunctionReturn<typeof functions.minLoanDuration>

export type OwnerParams = FunctionArguments<typeof functions.owner>
export type OwnerReturn = FunctionReturn<typeof functions.owner>

export type PayLoanBackParams = FunctionArguments<typeof functions.payLoanBack>
export type PayLoanBackReturn = FunctionReturn<typeof functions.payLoanBack>

export type PendingOwnerParams = FunctionArguments<typeof functions.pendingOwner>
export type PendingOwnerReturn = FunctionReturn<typeof functions.pendingOwner>

export type RealFloorValueParams = FunctionArguments<typeof functions.realFloorValue>
export type RealFloorValueReturn = FunctionReturn<typeof functions.realFloorValue>

export type ReceiveLoanParams = FunctionArguments<typeof functions.receiveLoan>
export type ReceiveLoanReturn = FunctionReturn<typeof functions.receiveLoan>

export type RedeemItemParams = FunctionArguments<typeof functions.redeemItem>
export type RedeemItemReturn = FunctionReturn<typeof functions.redeemItem>

export type RedemtionsOpenParams = FunctionArguments<typeof functions.redemtionsOpen>
export type RedemtionsOpenReturn = FunctionReturn<typeof functions.redemtionsOpen>

export type RenounceOwnershipParams = FunctionArguments<typeof functions.renounceOwnership>
export type RenounceOwnershipReturn = FunctionReturn<typeof functions.renounceOwnership>

export type SetAuctionHouseParams = FunctionArguments<typeof functions.setAuctionHouse>
export type SetAuctionHouseReturn = FunctionReturn<typeof functions.setAuctionHouse>

export type SetMinLoanDurationParams = FunctionArguments<typeof functions.setMinLoanDuration>
export type SetMinLoanDurationReturn = FunctionReturn<typeof functions.setMinLoanDuration>

export type SetRedemtionsParams = FunctionArguments<typeof functions.setRedemtions>
export type SetRedemtionsReturn = FunctionReturn<typeof functions.setRedemtions>

export type SetTermLimitParams = FunctionArguments<typeof functions.setTermLimit>
export type SetTermLimitReturn = FunctionReturn<typeof functions.setTermLimit>

export type TermLimitParams = FunctionArguments<typeof functions.termLimit>
export type TermLimitReturn = FunctionReturn<typeof functions.termLimit>

export type TransferOwnershipParams = FunctionArguments<typeof functions.transferOwnership>
export type TransferOwnershipReturn = FunctionReturn<typeof functions.transferOwnership>

export type WithdrawFeesParams = FunctionArguments<typeof functions.withdrawFees>
export type WithdrawFeesReturn = FunctionReturn<typeof functions.withdrawFees>

