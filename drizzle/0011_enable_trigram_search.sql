-- Typo and prefix tolerance for product search.
--
-- Full-text search only matches lexemes that are actually present, so "cotten
-- tee" and "tot" both return nothing however good the ranking is. Trigram
-- similarity closes that gap without adding Elasticsearch or Algolia to a store
-- with nine products.
--
-- Used as a *fallback*: the repository tries full-text first and only drops to
-- trigrams when that finds nothing, so exact matches keep their proper ranking
-- and the fuzzy path never dilutes a good result set.
--
-- A GIN trigram index on the concatenated text, because that is the expression
-- the fallback query compares against; indexing the columns separately would
-- not be used.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_trgm_idx" ON "products" USING gin (
  (
    coalesce("title", '') || ' ' ||
    coalesce("keywords", '') || ' ' ||
    coalesce("brand", '')
  ) gin_trgm_ops
);
