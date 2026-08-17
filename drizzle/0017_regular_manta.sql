ALTER TABLE "product_variants" ADD COLUMN "gtin_type" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "discovery_eligible" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "condition" text DEFAULT 'new' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "feed_description" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "product_category" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "mpn" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "identifier_exists" boolean DEFAULT false NOT NULL;