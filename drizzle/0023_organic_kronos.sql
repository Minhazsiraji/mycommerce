-- The two CREATE TABLE statements below are re-emitted because drizzle's
-- snapshot predates the custom repair migrations 0019 and 0022, which already
-- create these tables. Guarded with IF NOT EXISTS, matching those migrations, so
-- this runs on both an existing database and a fresh one. The DROP DEFAULT
-- statements are the actual change: client-specific defaults ('BDT', 'BD' and
-- the original store's wordmark) had no business being baked into the schema of
-- a white-label product. Existing row values are untouched.
CREATE TABLE IF NOT EXISTS "meta_integration_settings" (
	"store_key" text PRIMARY KEY DEFAULT 'default' NOT NULL,
	"tracking_enabled" boolean DEFAULT false NOT NULL,
	"pixel_id" text,
	"dataset_id" text,
	"access_token_encrypted" text,
	"test_event_code" text,
	"domain_verification" text,
	"last_connection_test_at" timestamp,
	"last_connection_status" text,
	"last_connection_message" text,
	"last_successful_event_at" timestamp,
	"last_successful_event_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "google_integration_settings" (
	"store_key" text PRIMARY KEY DEFAULT 'default' NOT NULL,
	"tracking_enabled" boolean DEFAULT false NOT NULL,
	"tag_id" text,
	"purchase_tracking_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "addresses" ALTER COLUMN "country" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "currency" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "currency" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "storefront_settings" ALTER COLUMN "hero_title" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "storefront_settings" ALTER COLUMN "hero_description" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "storefront_settings" ALTER COLUMN "hero_brand_text" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "storefront_settings" ALTER COLUMN "hero_brand_accent" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "storefront_settings" ALTER COLUMN "footer_brand_text" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "storefront_settings" ALTER COLUMN "footer_brand_accent" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "storefront_settings" ALTER COLUMN "footer_copyright" DROP DEFAULT;