import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, BooleanColumn as BooleanColumn_, DateTimeColumn as DateTimeColumn_, StringColumn as StringColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class AvailableToken {
    constructor(props?: Partial<AvailableToken>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @BooleanColumn_({nullable: false})
    isAvailable!: boolean

    @DateTimeColumn_({nullable: false})
    addedAt!: Date

    @DateTimeColumn_({nullable: false})
    updatedAt!: Date

    @StringColumn_({nullable: false})
    chain!: string
}
