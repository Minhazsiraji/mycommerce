/**
 * Constrains a user-supplied `?next=` value to a same-origin path.
 *
 * A naive `startsWith('/')` check is not enough: `//evil.com` also starts with a
 * slash and browsers treat it as a protocol-relative absolute URL, which turns the
 * login form into an open redirect. Backslashes are rejected too — some browsers
 * normalise `/\evil.com` the same way.
 */
export function safeRedirect(next: string | undefined, fallback = '/'): string {
  if (!next) return fallback
  if (!next.startsWith('/')) return fallback
  if (next.startsWith('//') || next.startsWith('/\\')) return fallback
  return next
}
