CREATE TABLE "shipping_rates" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"cost" integer NOT NULL,
	"free_over_subtotal" integer,
	"districts" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"estimated_days_min" integer DEFAULT 2 NOT NULL,
	"estimated_days_max" integer DEFAULT 5 NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "shipping_rates_active_idx" ON "shipping_rates" USING btree ("active","position");