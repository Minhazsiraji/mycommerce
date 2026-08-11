CREATE TABLE "meta_event_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"event_id" text NOT NULL,
	"event_name" text NOT NULL,
	"order_id" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meta_order_attributions" (
	"order_id" uuid PRIMARY KEY NOT NULL,
	"fbp" text,
	"fbc" text,
	"client_user_agent" text NOT NULL,
	"event_source_url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "meta_event_deliveries" ADD CONSTRAINT "meta_event_deliveries_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meta_order_attributions" ADD CONSTRAINT "meta_order_attributions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "meta_event_deliveries_event_idx" ON "meta_event_deliveries" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "meta_event_deliveries_retry_idx" ON "meta_event_deliveries" USING btree ("status","attempts","created_at");