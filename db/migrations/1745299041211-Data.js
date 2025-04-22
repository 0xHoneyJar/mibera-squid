module.exports = class Data1745299041211 {
    name = 'Data1745299041211'

    async up(db) {
        await db.query(`CREATE TABLE "loan" ("id" character varying NOT NULL, "amount" numeric NOT NULL, "expiry" TIMESTAMP WITH TIME ZONE NOT NULL, "status" character varying(9) NOT NULL, "nft_ids" text array NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL, "user_id" character varying, CONSTRAINT "PK_4ceda725a323d254a5fd48bf95f" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_53e13d0f4512c420ceb586f673" ON "loan" ("user_id") `)
        await db.query(`CREATE TABLE "user" ("id" character varying NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "daily_rfv" ("id" character varying NOT NULL, "value" numeric NOT NULL, "timestamp" numeric NOT NULL, "day" numeric NOT NULL, CONSTRAINT "PK_e5be91540152a2c864a10aa5061" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "available_token" ("id" character varying NOT NULL, "is_available" boolean NOT NULL, "added_at" TIMESTAMP WITH TIME ZONE NOT NULL, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL, "chain" text NOT NULL, CONSTRAINT "PK_657dcb37ad28d40c151a8434f27" PRIMARY KEY ("id"))`)
        await db.query(`ALTER TABLE "loan" ADD CONSTRAINT "FK_53e13d0f4512c420ceb586f6737" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    }

    async down(db) {
        await db.query(`DROP TABLE "loan"`)
        await db.query(`DROP INDEX "public"."IDX_53e13d0f4512c420ceb586f673"`)
        await db.query(`DROP TABLE "user"`)
        await db.query(`DROP TABLE "daily_rfv"`)
        await db.query(`DROP TABLE "available_token"`)
        await db.query(`ALTER TABLE "loan" DROP CONSTRAINT "FK_53e13d0f4512c420ceb586f6737"`)
    }
}
