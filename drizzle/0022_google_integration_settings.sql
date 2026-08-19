CREATE TABLE IF NOT EXISTS "google_integration_settings" (
  "store_key" text PRIMARY KEY DEFAULT 'default' NOT NULL,
  "tracking_enabled" boolean DEFAULT false NOT NULL,
  "tag_id" text,
  "purchase_tracking_enabled" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
