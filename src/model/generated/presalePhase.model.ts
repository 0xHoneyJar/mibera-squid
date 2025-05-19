import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, IntColumn as IntColumn_, StringColumn as StringColumn_, BigIntColumn as BigIntColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class PresalePhase {
    constructor(props?: Partial<PresalePhase>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @IntColumn_({nullable: false})
    phase!: number

    @StringColumn_({nullable: false})
    merkleRoot!: string

    @StringColumn_({nullable: false})
    refundRoot!: string

    @BigIntColumn_({nullable: false})
    priceInBERA!: bigint

    @IntColumn_({nullable: false})
    participationCount!: number

    @IntColumn_({nullable: false})
    refundCount!: number

    @BigIntColumn_({nullable: false})
    totalParticipationAmount!: bigint

    @BigIntColumn_({nullable: false})
    totalRefundAmount!: bigint
}
