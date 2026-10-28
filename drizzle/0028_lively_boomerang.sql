ALTER TABLE "product_variants" ADD COLUMN "cost_price" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "unit_cost" integer DEFAULT 0 NOT NULL;