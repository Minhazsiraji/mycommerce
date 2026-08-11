CREATE TABLE "fraud_blocks" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"kind" text NOT NULL,
	"value" text NOT NULL,
	"reason" text NOT NULL,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"revoked_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "upazila" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "union" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "checkout_ip" text;--> statement-breakpoint
ALTER TABLE "fraud_blocks" ADD CONSTRAINT "fraud_blocks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "fraud_blocks_active_value_idx" ON "fraud_blocks" USING btree ("kind","value") WHERE "fraud_blocks"."revoked_at" is null;--> statement-breakpoint
CREATE INDEX "fraud_blocks_created_idx" ON "fraud_blocks" USING btree ("created_at");