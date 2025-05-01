import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, OneToMany as OneToMany_} from "@subsquid/typeorm-store"
import {Loan} from "./loan.model"
import {Trade} from "./trade.model"

@Entity_()
export class User {
    constructor(props?: Partial<User>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @OneToMany_(() => Loan, e => e.user)
    loans!: Loan[]

    @OneToMany_(() => Trade, e => e.proposer)
    proposedTrades!: Trade[]

    @OneToMany_(() => Trade, e => e.acceptor)
    acceptedTrades!: Trade[]
}
