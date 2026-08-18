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
