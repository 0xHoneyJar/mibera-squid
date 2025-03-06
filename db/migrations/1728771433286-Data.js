module.exports = class Data1728771433286 {
    name = 'Data1728771433286'

    async up(db) {
        await db.query(`CREATE TABLE "holder" ("id" character varying NOT NULL, "address" text NOT NULL, "balances" text NOT NULL, "chain" text NOT NULL, CONSTRAINT "PK_8266ed18d931b168de2723ad322" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "snapshot" ("id" character varying NOT NULL, "block_number" numeric NOT NULL, "timestamp" numeric NOT NULL, "year" integer NOT NULL, "month" integer NOT NULL, "day" integer NOT NULL, "hour" integer NOT NULL, "contract_balances" text NOT NULL, "unique_holders" integer NOT NULL, "contract_type" text NOT NULL, "chain" text NOT NULL, CONSTRAINT "PK_47b29c1a6055220b1ebdafdf7b5" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "delegation" ("id" character varying NOT NULL, "delegator" text NOT NULL, "delegatee" text NOT NULL, "timestamp" numeric NOT NULL, "is_active" boolean NOT NULL, "chain" text NOT NULL, CONSTRAINT "PK_a2cb6c9b942d68b109131beab44" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "effective_holder" ("id" character varying NOT NULL, "address" text NOT NULL, "to" text NOT NULL, "latest_delegate" TIMESTAMP WITH TIME ZONE NOT NULL, "chain" text NOT NULL, CONSTRAINT "PK_892672a45523fa157e823ce37f4" PRIMARY KEY ("id"))`)
    }

    async down(db) {
        await db.query(`DROP TABLE "holder"`)
        await db.query(`DROP TABLE "snapshot"`)
        await db.query(`DROP TABLE "delegation"`)
        await db.query(`DROP TABLE "effective_holder"`)
    }
}
