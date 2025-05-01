import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_, BigIntColumn as BigIntColumn_, DateTimeColumn as DateTimeColumn_, StringColumn as StringColumn_} from "@subsquid/typeorm-store"
import {User} from "./user.model"
import {TradeStatus} from "./_tradeStatus"

@Entity_()
export class Trade {
    constructor(props?: Partial<Trade>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @ManyToOne_(() => User, {nullable: true})
    proposer!: User

    @Index_()
    @ManyToOne_(() => User, {nullable: true})
    acceptor!: User | undefined | null

    @BigIntColumn_({nullable: false})
    offeredTokenId!: bigint

    @BigIntColumn_({nullable: false})
    requestedTokenId!: bigint

    @Column_("varchar", {length: 9, nullable: false})
    status!: TradeStatus

    @DateTimeColumn_({nullable: false})
    proposedAt!: Date

    @DateTimeColumn_({nullable: true})
    completedAt!: Date | undefined | null

    @StringColumn_({nullable: false})
    chain!: string
}
