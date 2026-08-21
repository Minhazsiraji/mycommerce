import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

/**
 * Client-authored replacements for the built-in policy pages.
 *
 * The bundled Terms, Privacy, Returns and Shipping text was written for one
 * Bangladeshi retailer. It is a reasonable starting point and a poor final
 * answer: return windows, delivery coverage, warranty position and governing
 * law are business decisions, not software behaviour. Before this table the
 * only way to change them was to edit our React source, which is not something
 * a client of a white-label product should ever have to do.
 *
 * A row here replaces the built-in page entirely. No row means the template is
 * still showing, which Admin says plainly.
 *
 * Body is plain text, rendered as escaped paragraphs — never HTML. Policy pages
 * are edited by whoever holds the admin account, and a stored-XSS hole on a
 * page every customer visits is not worth the formatting.
 */
export const policyPages = pgTable('policy_pages', {
  slug: text('slug').primaryKey(),
  title: text('title').notNull(),
  summary: text('summary').notNull(),
  body: text('body').notNull(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export type PolicyPage = typeof policyPages.$inferSelect
