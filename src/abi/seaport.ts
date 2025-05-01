import * as p from '@subsquid/evm-codec'
import { event, fun, viewFun, indexed, ContractBase } from '@subsquid/evm-abi'
import type { EventParams as EParams, FunctionArguments, FunctionReturn } from '@subsquid/evm-abi'

export const events = {
    CounterIncremented: event("0x721c20121297512b72821b97f5326877ea8ecf4bb9948fea5bfcb6453074d37f", "CounterIncremented(uint256,address)", {"newCounter": p.uint256, "offerer": indexed(p.address)}),
    OrderCancelled: event("0x6bacc01dbe442496068f7d234edd811f1a5f833243e0aec824f86ab861f3c90d", "OrderCancelled(bytes32,address,address)", {"orderHash": p.bytes32, "offerer": indexed(p.address), "zone": indexed(p.address)}),
    OrderFulfilled: event("0x9d9af8e38d66c62e2c12f0225249fd9d721c54b83f48d9352c97c6cacdcb6f31", "OrderFulfilled(bytes32,address,address,address,(uint8,address,uint256,uint256)[],(uint8,address,uint256,uint256,address)[])", {"orderHash": p.bytes32, "offerer": indexed(p.address), "zone": indexed(p.address), "recipient": p.address, "offer": p.array(p.struct({"itemType": p.uint8, "token": p.address, "identifier": p.uint256, "amount": p.uint256})), "consideration": p.array(p.struct({"itemType": p.uint8, "token": p.address, "identifier": p.uint256, "amount": p.uint256, "recipient": p.address}))}),
    OrderValidated: event("0xf280791efe782edcf06ce15c8f4dff17601db3b88eb3805a0db7d77faf757f04", "OrderValidated(bytes32,(address,address,(uint8,address,uint256,uint256,uint256)[],(uint8,address,uint256,uint256,uint256,address)[],uint8,uint256,uint256,bytes32,uint256,bytes32,uint256))", {"orderHash": p.bytes32, "orderParameters": p.struct({"offerer": p.address, "zone": p.address, "offer": p.array(p.struct({"itemType": p.uint8, "token": p.address, "identifierOrCriteria": p.uint256, "startAmount": p.uint256, "endAmount": p.uint256})), "consideration": p.array(p.struct({"itemType": p.uint8, "token": p.address, "identifierOrCriteria": p.uint256, "startAmount": p.uint256, "endAmount": p.uint256, "recipient": p.address})), "orderType": p.uint8, "startTime": p.uint256, "endTime": p.uint256, "zoneHash": p.bytes32, "salt": p.uint256, "conduitKey": p.bytes32, "totalOriginalConsiderationItems": p.uint256})}),
    OrdersMatched: event("0x4b9f2d36e1b4c93de62cc077b00b1a91d84b6c31b4a14e012718dcca230689e7", "OrdersMatched(bytes32[])", {"orderHashes": p.array(p.bytes32)}),
}

export const functions = {
    __activateTstore: fun("0x7423eb3c", "__activateTstore()", {}, ),
    cancel: fun("0xfd9f1e10", "cancel((address,address,(uint8,address,uint256,uint256,uint256)[],(uint8,address,uint256,uint256,uint256,address)[],uint8,uint256,uint256,bytes32,uint256,bytes32,uint256)[])", {"orders": p.array(p.struct({"offerer": p.address, "zone": p.address, "offer": p.array(p.struct({"itemType": p.uint8, "token": p.address, "identifierOrCriteria": p.uint256, "startAmount": p.uint256, "endAmount": p.uint256})), "consideration": p.array(p.struct({"itemType": p.uint8, "token": p.address, "identifierOrCriteria": p.uint256, "startAmount": p.uint256, "endAmount": p.uint256, "recipient": p.address})), "orderType": p.uint8, "startTime": p.uint256, "endTime": p.uint256, "zoneHash": p.bytes32, "salt": p.uint256, "conduitKey": p.bytes32, "counter": p.uint256}))}, p.bool),
    fulfillAdvancedOrder: fun("0xe7acab24", "fulfillAdvancedOrder(((address,address,(uint8,address,uint256,uint256,uint256)[],(uint8,address,uint256,uint256,uint256,address)[],uint8,uint256,uint256,bytes32,uint256,bytes32,uint256),uint120,uint120,bytes,bytes),(uint256,uint8,uint256,uint256,bytes32[])[],bytes32,address)", {"_0": p.struct({"parameters": p.struct({"offerer": p.address, "zone": p.address, "offer": p.array(p.struct({"itemType": p.uint8, "token": p.address, "identifierOrCriteria": p.uint256, "startAmount": p.uint256, "endAmount": p.uint256})), "consideration": p.array(p.struct({"itemType": p.uint8, "token": p.address, "identifierOrCriteria": p.uint256, "startAmount": p.uint256, "endAmount": p.uint256, "recipient": p.address})), "orderType": p.uint8, "startTime": p.uint256, "endTime": p.uint256, "zoneHash": p.bytes32, "salt": p.uint256, "conduitKey": p.bytes32, "totalOriginalConsiderationItems": p.uint256}), "numerator": p.uint120, "denominator": p.uint120, "signature": p.bytes, "extraData": p.bytes}), "_1": p.array(p.struct({"orderIndex": p.uint256, "side": p.uint8, "index": p.uint256, "identifier": p.uint256, "criteriaProof": p.array(p.bytes32)})), "fulfillerConduitKey": p.bytes32, "recipient": p.address}, p.bool),
    fulfillAvailableAdvancedOrders: fun("0x87201b41", "fulfillAvailableAdvancedOrders(((address,address,(uint8,address,uint256,uint256,uint256)[],(uint8,address,uint256,uint256,uint256,address)[],uint8,uint256,uint256,bytes32,uint256,bytes32,uint256),uint120,uint120,bytes,bytes)[],(uint256,uint8,uint256,uint256,bytes32[])[],(uint256,uint256)[][],(uint256,uint256)[][],bytes32,address,uint256)", {"_0": p.array(p.struct({"parameters": p.struct({"offerer": p.address, "zone": p.address, "offer": p.array(p.struct({"itemType": p.uint8, "token": p.address, "identifierOrCriteria": p.uint256, "startAmount": p.uint256, "endAmount": p.uint256})), "consideration": p.array(p.struct({"itemType": p.uint8, "token": p.address, "identifierOrCriteria": p.uint256, "startAmount": p.uint256, "endAmount": p.uint256, "recipient": p.address})), "orderType": p.uint8, "startTime": p.uint256, "endTime": p.uint256, "zoneHash": p.bytes32, "salt": p.uint256, "conduitKey": p.bytes32, "totalOriginalConsiderationItems": p.uint256}), "numerator": p.uint120, "denominator": p.uint120, "signature": p.bytes, "extraData": p.bytes})), "_1": p.array(p.struct({"orderIndex": p.uint256, "side": p.uint8, "index": p.uint256, "identifier": p.uint256, "criteriaProof": p.array(p.bytes32)})), "_2": p.array(p.array(p.struct({"orderIndex": p.uint256, "itemIndex": p.uint256}))), "_3": p.array(p.array(p.struct({"orderIndex": p.uint256, "itemIndex": p.uint256}))), "fulfillerConduitKey": p.bytes32, "recipient": p.address, "maximumFulfilled": p.uint256}, {"_0": p.array(p.bool), "_1": p.array(p.struct({"item": p.struct({"itemType": p.uint8, "token": p.address, "identifier": p.uint256, "amount": p.uint256, "recipient": p.address}), "offerer": p.address, "conduitKey": p.bytes32}))}),
    fulfillAvailableOrders: fun("0xed98a574", "fulfillAvailableOrders(((address,address,(uint8,address,uint256,uint256,uint256)[],(uint8,address,uint256,uint256,uint256,address)[],uint8,uint256,uint256,bytes32,uint256,bytes32,uint256),bytes)[],(uint256,uint256)[][],(uint256,uint256)[][],bytes32,uint256)", {"_0": p.array(p.struct({"parameters": p.struct({"offerer": p.address, "zone": p.address, "offer": p.array(p.struct({"itemType": p.uint8, "token": p.address, "identifierOrCriteria": p.uint256, "startAmount": p.uint256, "endAmount": p.uint256})), "consideration": p.array(p.struct({"itemType": p.uint8, "token": p.address, "identifierOrCriteria": p.uint256, "startAmount": p.uint256, "endAmount": p.uint256, "recipient": p.address})), "orderType": p.uint8, "startTime": p.uint256, "endTime": p.uint256, "zoneHash": p.bytes32, "salt": p.uint256, "conduitKey": p.bytes32, "totalOriginalConsiderationItems": p.uint256}), "signature": p.bytes})), "_1": p.array(p.array(p.struct({"orderIndex": p.uint256, "itemIndex": p.uint256}))), "_2": p.array(p.array(p.struct({"orderIndex": p.uint256, "itemIndex": p.uint256}))), "fulfillerConduitKey": p.bytes32, "maximumFulfilled": p.uint256}, {"_0": p.array(p.bool), "_1": p.array(p.struct({"item": p.struct({"itemType": p.uint8, "token": p.address, "identifier": p.uint256, "amount": p.uint256, "recipient": p.address}), "offerer": p.address, "conduitKey": p.bytes32}))}),
    fulfillBasicOrder: fun("0xfb0f3ee1", "fulfillBasicOrder((address,uint256,uint256,address,address,address,uint256,uint256,uint8,uint256,uint256,bytes32,uint256,bytes32,bytes32,uint256,(uint256,address)[],bytes))", {"_0": p.struct({"considerationToken": p.address, "considerationIdentifier": p.uint256, "considerationAmount": p.uint256, "offerer": p.address, "zone": p.address, "offerToken": p.address, "offerIdentifier": p.uint256, "offerAmount": p.uint256, "basicOrderType": p.uint8, "startTime": p.uint256, "endTime": p.uint256, "zoneHash": p.bytes32, "salt": p.uint256, "offererConduitKey": p.bytes32, "fulfillerConduitKey": p.bytes32, "totalOriginalAdditionalRecipients": p.uint256, "additionalRecipients": p.array(p.struct({"amount": p.uint256, "recipient": p.address})), "signature": p.bytes})}, p.bool),
    fulfillBasicOrder_efficient_6GL6yc: fun("0x00000000", "fulfillBasicOrder_efficient_6GL6yc((address,uint256,uint256,address,address,address,uint256,uint256,uint8,uint256,uint256,bytes32,uint256,bytes32,bytes32,uint256,(uint256,address)[],bytes))", {"_0": p.struct({"considerationToken": p.address, "considerationIdentifier": p.uint256, "considerationAmount": p.uint256, "offerer": p.address, "zone": p.address, "offerToken": p.address, "offerIdentifier": p.uint256, "offerAmount": p.uint256, "basicOrderType": p.uint8, "startTime": p.uint256, "endTime": p.uint256, "zoneHash": p.bytes32, "salt": p.uint256, "offererConduitKey": p.bytes32, "fulfillerConduitKey": p.bytes32, "totalOriginalAdditionalRecipients": p.uint256, "additionalRecipients": p.array(p.struct({"amount": p.uint256, "recipient": p.address})), "signature": p.bytes})}, p.bool),
    fulfillOrder: fun("0xb3a34c4c", "fulfillOrder(((address,address,(uint8,address,uint256,uint256,uint256)[],(uint8,address,uint256,uint256,uint256,address)[],uint8,uint256,uint256,bytes32,uint256,bytes32,uint256),bytes),bytes32)", {"_0": p.struct({"parameters": p.struct({"offerer": p.address, "zone": p.address, "offer": p.array(p.struct({"itemType": p.uint8, "token": p.address, "identifierOrCriteria": p.uint256, "startAmount": p.uint256, "endAmount": p.uint256})), "consideration": p.array(p.struct({"itemType": p.uint8, "token": p.address, "identifierOrCriteria": p.uint256, "startAmount": p.uint256, "endAmount": p.uint256, "recipient": p.address})), "orderType": p.uint8, "startTime": p.uint256, "endTime": p.uint256, "zoneHash": p.bytes32, "salt": p.uint256, "conduitKey": p.bytes32, "totalOriginalConsiderationItems": p.uint256}), "signature": p.bytes}), "fulfillerConduitKey": p.bytes32}, p.bool),
    getContractOffererNonce: viewFun("0xa900866b", "getContractOffererNonce(address)", {"contractOfferer": p.address}, p.uint256),
    getCounter: viewFun("0xf07ec373", "getCounter(address)", {"offerer": p.address}, p.uint256),
    getOrderHash: viewFun("0x79df72bd", "getOrderHash((address,address,(uint8,address,uint256,uint256,uint256)[],(uint8,address,uint256,uint256,uint256,address)[],uint8,uint256,uint256,bytes32,uint256,bytes32,uint256))", {"_0": p.struct({"offerer": p.address, "zone": p.address, "offer": p.array(p.struct({"itemType": p.uint8, "token": p.address, "identifierOrCriteria": p.uint256, "startAmount": p.uint256, "endAmount": p.uint256})), "consideration": p.array(p.struct({"itemType": p.uint8, "token": p.address, "identifierOrCriteria": p.uint256, "startAmount": p.uint256, "endAmount": p.uint256, "recipient": p.address})), "orderType": p.uint8, "startTime": p.uint256, "endTime": p.uint256, "zoneHash": p.bytes32, "salt": p.uint256, "conduitKey": p.bytes32, "counter": p.uint256})}, p.bytes32),
    getOrderStatus: viewFun("0x46423aa7", "getOrderStatus(bytes32)", {"orderHash": p.bytes32}, {"isValidated": p.bool, "isCancelled": p.bool, "totalFilled": p.uint256, "totalSize": p.uint256}),
    incrementCounter: fun("0x5b34b966", "incrementCounter()", {}, p.uint256),
    information: viewFun("0xf47b7740", "information()", {}, {"version": p.string, "domainSeparator": p.bytes32, "conduitController": p.address}),
    matchAdvancedOrders: fun("0xf2d12b12", "matchAdvancedOrders(((address,address,(uint8,address,uint256,uint256,uint256)[],(uint8,address,uint256,uint256,uint256,address)[],uint8,uint256,uint256,bytes32,uint256,bytes32,uint256),uint120,uint120,bytes,bytes)[],(uint256,uint8,uint256,uint256,bytes32[])[],((uint256,uint256)[],(uint256,uint256)[])[],address)", {"_0": p.array(p.struct({"parameters": p.struct({"offerer": p.address, "zone": p.address, "offer": p.array(p.struct({"itemType": p.uint8, "token": p.address, "identifierOrCriteria": p.uint256, "startAmount": p.uint256, "endAmount": p.uint256})), "consideration": p.array(p.struct({"itemType": p.uint8, "token": p.address, "identifierOrCriteria": p.uint256, "startAmount": p.uint256, "endAmount": p.uint256, "recipient": p.address})), "orderType": p.uint8, "startTime": p.uint256, "endTime": p.uint256, "zoneHash": p.bytes32, "salt": p.uint256, "conduitKey": p.bytes32, "totalOriginalConsiderationItems": p.uint256}), "numerator": p.uint120, "denominator": p.uint120, "signature": p.bytes, "extraData": p.bytes})), "_1": p.array(p.struct({"orderIndex": p.uint256, "side": p.uint8, "index": p.uint256, "identifier": p.uint256, "criteriaProof": p.array(p.bytes32)})), "_2": p.array(p.struct({"offerComponents": p.array(p.struct({"orderIndex": p.uint256, "itemIndex": p.uint256})), "considerationComponents": p.array(p.struct({"orderIndex": p.uint256, "itemIndex": p.uint256}))})), "recipient": p.address}, p.array(p.struct({"item": p.struct({"itemType": p.uint8, "token": p.address, "identifier": p.uint256, "amount": p.uint256, "recipient": p.address}), "offerer": p.address, "conduitKey": p.bytes32}))),
    matchOrders: fun("0xa8174404", "matchOrders(((address,address,(uint8,address,uint256,uint256,uint256)[],(uint8,address,uint256,uint256,uint256,address)[],uint8,uint256,uint256,bytes32,uint256,bytes32,uint256),bytes)[],((uint256,uint256)[],(uint256,uint256)[])[])", {"_0": p.array(p.struct({"parameters": p.struct({"offerer": p.address, "zone": p.address, "offer": p.array(p.struct({"itemType": p.uint8, "token": p.address, "identifierOrCriteria": p.uint256, "startAmount": p.uint256, "endAmount": p.uint256})), "consideration": p.array(p.struct({"itemType": p.uint8, "token": p.address, "identifierOrCriteria": p.uint256, "startAmount": p.uint256, "endAmount": p.uint256, "recipient": p.address})), "orderType": p.uint8, "startTime": p.uint256, "endTime": p.uint256, "zoneHash": p.bytes32, "salt": p.uint256, "conduitKey": p.bytes32, "totalOriginalConsiderationItems": p.uint256}), "signature": p.bytes})), "_1": p.array(p.struct({"offerComponents": p.array(p.struct({"orderIndex": p.uint256, "itemIndex": p.uint256})), "considerationComponents": p.array(p.struct({"orderIndex": p.uint256, "itemIndex": p.uint256}))}))}, p.array(p.struct({"item": p.struct({"itemType": p.uint8, "token": p.address, "identifier": p.uint256, "amount": p.uint256, "recipient": p.address}), "offerer": p.address, "conduitKey": p.bytes32}))),
    name: viewFun("0x06fdde03", "name()", {}, p.string),
    validate: fun("0x88147732", "validate(((address,address,(uint8,address,uint256,uint256,uint256)[],(uint8,address,uint256,uint256,uint256,address)[],uint8,uint256,uint256,bytes32,uint256,bytes32,uint256),bytes)[])", {"_0": p.array(p.struct({"parameters": p.struct({"offerer": p.address, "zone": p.address, "offer": p.array(p.struct({"itemType": p.uint8, "token": p.address, "identifierOrCriteria": p.uint256, "startAmount": p.uint256, "endAmount": p.uint256})), "consideration": p.array(p.struct({"itemType": p.uint8, "token": p.address, "identifierOrCriteria": p.uint256, "startAmount": p.uint256, "endAmount": p.uint256, "recipient": p.address})), "orderType": p.uint8, "startTime": p.uint256, "endTime": p.uint256, "zoneHash": p.bytes32, "salt": p.uint256, "conduitKey": p.bytes32, "totalOriginalConsiderationItems": p.uint256}), "signature": p.bytes}))}, p.bool),
}

export class Contract extends ContractBase {

    getContractOffererNonce(contractOfferer: GetContractOffererNonceParams["contractOfferer"]) {
        return this.eth_call(functions.getContractOffererNonce, {contractOfferer})
    }

    getCounter(offerer: GetCounterParams["offerer"]) {
        return this.eth_call(functions.getCounter, {offerer})
    }

    getOrderHash(_0: GetOrderHashParams["_0"]) {
        return this.eth_call(functions.getOrderHash, {_0})
    }

    getOrderStatus(orderHash: GetOrderStatusParams["orderHash"]) {
        return this.eth_call(functions.getOrderStatus, {orderHash})
    }

    information() {
        return this.eth_call(functions.information, {})
    }

    name() {
        return this.eth_call(functions.name, {})
    }
}

/// Event types
export type CounterIncrementedEventArgs = EParams<typeof events.CounterIncremented>
export type OrderCancelledEventArgs = EParams<typeof events.OrderCancelled>
export type OrderFulfilledEventArgs = EParams<typeof events.OrderFulfilled>
export type OrderValidatedEventArgs = EParams<typeof events.OrderValidated>
export type OrdersMatchedEventArgs = EParams<typeof events.OrdersMatched>

/// Function types
export type __activateTstoreParams = FunctionArguments<typeof functions.__activateTstore>
export type __activateTstoreReturn = FunctionReturn<typeof functions.__activateTstore>

export type CancelParams = FunctionArguments<typeof functions.cancel>
export type CancelReturn = FunctionReturn<typeof functions.cancel>

export type FulfillAdvancedOrderParams = FunctionArguments<typeof functions.fulfillAdvancedOrder>
export type FulfillAdvancedOrderReturn = FunctionReturn<typeof functions.fulfillAdvancedOrder>

export type FulfillAvailableAdvancedOrdersParams = FunctionArguments<typeof functions.fulfillAvailableAdvancedOrders>
export type FulfillAvailableAdvancedOrdersReturn = FunctionReturn<typeof functions.fulfillAvailableAdvancedOrders>

export type FulfillAvailableOrdersParams = FunctionArguments<typeof functions.fulfillAvailableOrders>
export type FulfillAvailableOrdersReturn = FunctionReturn<typeof functions.fulfillAvailableOrders>

export type FulfillBasicOrderParams = FunctionArguments<typeof functions.fulfillBasicOrder>
export type FulfillBasicOrderReturn = FunctionReturn<typeof functions.fulfillBasicOrder>

export type FulfillBasicOrder_efficient_6GL6ycParams = FunctionArguments<typeof functions.fulfillBasicOrder_efficient_6GL6yc>
export type FulfillBasicOrder_efficient_6GL6ycReturn = FunctionReturn<typeof functions.fulfillBasicOrder_efficient_6GL6yc>

export type FulfillOrderParams = FunctionArguments<typeof functions.fulfillOrder>
export type FulfillOrderReturn = FunctionReturn<typeof functions.fulfillOrder>

export type GetContractOffererNonceParams = FunctionArguments<typeof functions.getContractOffererNonce>
export type GetContractOffererNonceReturn = FunctionReturn<typeof functions.getContractOffererNonce>

export type GetCounterParams = FunctionArguments<typeof functions.getCounter>
export type GetCounterReturn = FunctionReturn<typeof functions.getCounter>

export type GetOrderHashParams = FunctionArguments<typeof functions.getOrderHash>
export type GetOrderHashReturn = FunctionReturn<typeof functions.getOrderHash>

export type GetOrderStatusParams = FunctionArguments<typeof functions.getOrderStatus>
export type GetOrderStatusReturn = FunctionReturn<typeof functions.getOrderStatus>

export type IncrementCounterParams = FunctionArguments<typeof functions.incrementCounter>
export type IncrementCounterReturn = FunctionReturn<typeof functions.incrementCounter>

export type InformationParams = FunctionArguments<typeof functions.information>
export type InformationReturn = FunctionReturn<typeof functions.information>

export type MatchAdvancedOrdersParams = FunctionArguments<typeof functions.matchAdvancedOrders>
export type MatchAdvancedOrdersReturn = FunctionReturn<typeof functions.matchAdvancedOrders>

export type MatchOrdersParams = FunctionArguments<typeof functions.matchOrders>
export type MatchOrdersReturn = FunctionReturn<typeof functions.matchOrders>

export type NameParams = FunctionArguments<typeof functions.name>
export type NameReturn = FunctionReturn<typeof functions.name>

export type ValidateParams = FunctionArguments<typeof functions.validate>
export type ValidateReturn = FunctionReturn<typeof functions.validate>

