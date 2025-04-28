module.exports = class Data1745798308745 {
    name = 'Data1745798308745'

    async up(db) {
        await db.query(`CREATE TABLE "loan" ("id" character varying NOT NULL, "amount" numeric NOT NULL, "expiry" TIMESTAMP WITH TIME ZONE NOT NULL, "status" character varying(9) NOT NULL, "nft_ids" text array NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL, "user_id" character varying, CONSTRAINT "PK_4ceda725a323d254a5fd48bf95f" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_53e13d0f4512c420ceb586f673" ON "loan" ("user_id") `)
        await db.query(`CREATE TABLE "user" ("id" character varying NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "daily_rfv" ("id" character varying NOT NULL, "value" numeric NOT NULL, "timestamp" numeric NOT NULL, "day" numeric NOT NULL, CONSTRAINT "PK_e5be91540152a2c864a10aa5061" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "available_token" ("id" character varying NOT NULL, "is_available" boolean NOT NULL, "added_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL, "chain" text NOT NULL, CONSTRAINT "PK_657dcb37ad28d40c151a8434f27" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "order" ("id" character varying NOT NULL, "user" text NOT NULL, "token_id" numeric NOT NULL, "amount" numeric NOT NULL, "timestamp" numeric NOT NULL, "block_number" numeric NOT NULL, "tx_hash" text NOT NULL, "operator" text NOT NULL, CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "user_token_balance" ("id" character varying NOT NULL, "user" text NOT NULL, "token_id" numeric NOT NULL, "balance" numeric NOT NULL, "last_updated_at" numeric NOT NULL, CONSTRAINT "PK_78d5213f89ff28e01e7aba83aee" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "mint_activity" ("id" character varying NOT NULL, "user" text NOT NULL, "contract" text NOT NULL, "token_standard" text NOT NULL, "token_id" numeric, "amount" numeric, "quantity" numeric, "timestamp" numeric NOT NULL, "block_number" numeric NOT NULL, "tx_hash" text NOT NULL, "operator" text, "amount_paid" numeric NOT NULL, CONSTRAINT "PK_2dfe67a19ae362ce4c9a60e56d6" PRIMARY KEY ("id"))`)
        await db.query(`ALTER TABLE "loan" ADD CONSTRAINT "FK_53e13d0f4512c420ceb586f6737" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    }

    async down(db) {
        await db.query(`DROP TABLE "loan"`)
        await db.query(`DROP INDEX "public"."IDX_53e13d0f4512c420ceb586f673"`)
        await db.query(`DROP TABLE "user"`)
        await db.query(`DROP TABLE "daily_rfv"`)
        await db.query(`DROP TABLE "available_token"`)
        await db.query(`DROP TABLE "order"`)
        await db.query(`DROP TABLE "user_token_balance"`)
        await db.query(`DROP TABLE "mint_activity"`)
        await db.query(`ALTER TABLE "loan" DROP CONSTRAINT "FK_53e13d0f4512c420ceb586f6737"`)
    }
}
