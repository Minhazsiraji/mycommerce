CREATE TABLE "meta_integration_settings" (
  "store_key" text PRIMARY KEY NOT NULL,
  "enabled" boolean DEFAULT false NOT NULL,
  "pixel_id" text,
  "dataset_id" text,
  "access_token_encrypted" text,
  "test_event_code" text,
  "domain_verification_code" text,
  "last_test_status" text,
  "last_test_message" text,
  "last_tested_at" timestamp,
  "last_successful_event_name" text,
  "last_successful_event_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
