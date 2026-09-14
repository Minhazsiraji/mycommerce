ALTER TABLE "meta_order_attributions" ADD COLUMN "fbclid" text;--> statement-breakpoint
ALTER TABLE "meta_order_attributions" ADD COLUMN "utm" jsonb;--> statement-breakpoint
ALTER TABLE "meta_order_attributions" ADD COLUMN "ad_params" jsonb;