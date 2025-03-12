module.exports = class Data1741741859551 {
    name = 'Data1741741859551'

    async up(db) {
        await db.query(`CREATE TABLE "participation" ("id" character varying NOT NULL, "phase" integer NOT NULL, "user" text NOT NULL, "amount" numeric NOT NULL, "timestamp" numeric NOT NULL, "block_number" numeric NOT NULL, "tx_hash" text NOT NULL, CONSTRAINT "PK_ba5442bab90fc96ddde456c69e1" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "refund" ("id" character varying NOT NULL, "phase" integer NOT NULL, "user" text NOT NULL, "amount" numeric NOT NULL, "timestamp" numeric NOT NULL, "block_number" numeric NOT NULL, "tx_hash" text NOT NULL, CONSTRAINT "PK_f1cefa2e60d99b206c46c1116e5" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "presale_phase" ("id" character varying NOT NULL, "phase" integer NOT NULL, "merkle_root" text NOT NULL, "refund_root" text NOT NULL, "price_in_bera" numeric NOT NULL, "participation_count" integer NOT NULL, "refund_count" integer NOT NULL, "total_participation_amount" numeric NOT NULL, "total_refund_amount" numeric NOT NULL, CONSTRAINT "PK_94cfc8bf14a9554f1a13c085263" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "presale_stats" ("id" character varying NOT NULL, "current_phase" integer NOT NULL, "total_participants" integer NOT NULL, "unique_participants" integer NOT NULL, "total_participation_amount" numeric NOT NULL, "total_refund_amount" numeric NOT NULL, CONSTRAINT "PK_a4aaafa57a6a8a3e6f17986849b" PRIMARY KEY ("id"))`)
    }

    async down(db) {
        await db.query(`DROP TABLE "participation"`)
        await db.query(`DROP TABLE "refund"`)
        await db.query(`DROP TABLE "presale_phase"`)
        await db.query(`DROP TABLE "presale_stats"`)
    }
}
