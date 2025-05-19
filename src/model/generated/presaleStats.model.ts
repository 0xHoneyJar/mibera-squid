import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, IntColumn as IntColumn_, BigIntColumn as BigIntColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class PresaleStats {
    constructor(props?: Partial<PresaleStats>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @IntColumn_({nullable: false})
    currentPhase!: number

    @IntColumn_({nullable: false})
    totalParticipants!: number

    @IntColumn_({nullable: false})
    uniqueParticipants!: number

    @BigIntColumn_({nullable: false})
    totalParticipationAmount!: bigint

    @BigIntColumn_({nullable: false})
    totalRefundAmount!: bigint
}
