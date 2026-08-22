CREATE TABLE "policy_settings" (
	"id" text PRIMARY KEY DEFAULT 'default' NOT NULL,
	"return_window_days" integer,
	"refund_processing_min_days" integer,
	"refund_processing_max_days" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
