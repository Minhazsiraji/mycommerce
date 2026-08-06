/**
 * Escapes a value for interpolation into hand-built HTML.
 *
 * React escapes for us on the web; the email templates in
 * `modules/notifications` are string concatenation with no such protection, and
 * the shipping recipient that reaches them is typed by the customer. An
 * unescaped `<a href="...">` in a name field becomes an attacker-authored link
 * inside a mail the store's own domain signed.
 *
 * The ampersand must be replaced first, or escaping a literal `&lt;` would
 * produce a working `<`.
 */
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}
