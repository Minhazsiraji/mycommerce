ALTER TABLE "order_items" ADD COLUMN "product_id" uuid;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "category_id" uuid;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "category_name" text;--> statement-breakpoint
UPDATE "order_items" AS oi
SET
	"product_id" = p."id",
	"category_id" = p."category_id",
	"category_name" = c."name"
FROM "product_variants" AS pv
INNER JOIN "products" AS p ON p."id" = pv."product_id"
LEFT JOIN "categories" AS c ON c."id" = p."category_id"
WHERE oi."variant_id" = pv."id";--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "order_items_product_idx" ON "order_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "order_items_category_idx" ON "order_items" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "orders_created_idx" ON "orders" USING btree ("created_at");
