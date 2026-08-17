ALTER TABLE "storefront_settings" ADD COLUMN "footer_brand_text" text DEFAULT 'Siraji' NOT NULL;--> statement-breakpoint
ALTER TABLE "storefront_settings" ADD COLUMN "footer_brand_accent" text DEFAULT 'BD' NOT NULL;--> statement-breakpoint
ALTER TABLE "storefront_settings" ADD COLUMN "footer_description" text DEFAULT 'Clear choices. Honest information. A shopping journey you can understand.' NOT NULL;--> statement-breakpoint
ALTER TABLE "storefront_settings" ADD COLUMN "footer_copyright" text DEFAULT '© @AgentSiraji' NOT NULL;