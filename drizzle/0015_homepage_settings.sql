CREATE TABLE "storefront_settings" (
	"id" text PRIMARY KEY DEFAULT 'default' NOT NULL,
	"announcement_enabled" boolean DEFAULT true NOT NULL,
	"announcement_delivery_text" text,
	"announcement_offer_text" text,
	"hero_enabled" boolean DEFAULT true NOT NULL,
	"hero_title" text DEFAULT 'Smarter everyday shopping for modern life in Bangladesh.' NOT NULL,
	"hero_description" text DEFAULT 'Browse practical products with clear prices and a simple shopping experience built for Bangladesh.' NOT NULL,
	"hero_primary_label" text DEFAULT 'Browse categories' NOT NULL,
	"hero_primary_href" text DEFAULT '#categories' NOT NULL,
	"hero_secondary_label" text DEFAULT 'Search products' NOT NULL,
	"hero_secondary_href" text DEFAULT '/search' NOT NULL,
	"hero_brand_text" text DEFAULT 'Siraji' NOT NULL,
	"hero_brand_accent" text DEFAULT 'BD' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
