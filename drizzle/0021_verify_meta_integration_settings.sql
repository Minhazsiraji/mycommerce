ALTER TABLE "meta_integration_settings"
  ADD COLUMN IF NOT EXISTS "tracking_enabled" boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS "pixel_id" text,
  ADD COLUMN IF NOT EXISTS "dataset_id" text,
  ADD COLUMN IF NOT EXISTS "access_token_encrypted" text,
  ADD COLUMN IF NOT EXISTS "test_event_code" text,
  ADD COLUMN IF NOT EXISTS "domain_verification" text,
  ADD COLUMN IF NOT EXISTS "last_connection_test_at" timestamp,
  ADD COLUMN IF NOT EXISTS "last_connection_status" text,
  ADD COLUMN IF NOT EXISTS "last_connection_message" text,
  ADD COLUMN IF NOT EXISTS "last_successful_event_at" timestamp,
  ADD COLUMN IF NOT EXISTS "last_successful_event_name" text,
  ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT now() NOT NULL,
  ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now() NOT NULL;
