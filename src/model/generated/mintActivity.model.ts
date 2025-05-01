import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, BigIntColumn as BigIntColumn_} from "@subsquid/typeorm-store"
import {ActivityType} from "./_activityType"

@Entity_()
export class MintActivity {
    constructor(props?: Partial<MintActivity>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @StringColumn_({nullable: false})
    user!: string

    @StringColumn_({nullable: false})
    contract!: string

    @StringColumn_({nullable: false})
    tokenStandard!: string

    @BigIntColumn_({nullable: true})
    tokenId!: bigint | undefined | null

    @BigIntColumn_({nullable: true})
    amount!: bigint | undefined | null

    @BigIntColumn_({nullable: true})
    quantity!: bigint | undefined | null

    @BigIntColumn_({nullable: false})
    timestamp!: bigint

    @BigIntColumn_({nullable: false})
    blockNumber!: bigint

    @StringColumn_({nullable: false})
    txHash!: string

    @StringColumn_({nullable: true})
    operator!: string | undefined | null

    @BigIntColumn_({nullable: false})
    amountPaid!: bigint

    @Column_("varchar", {length: 8, nullable: false})
    activityType!: ActivityType
}
