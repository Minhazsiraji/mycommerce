import { describe, expect, it } from 'vitest'

import { escapeHtml } from './escape-html'

/**
 * These templates are hand-built HTML strings with no React in the way, and the
 * shipping recipient reaching them is typed by the customer.
 */
describe('escapeHtml', () => {
  it('neutralises a link a customer put in their name', () => {
    const escaped = escapeHtml('<a href="https://evil.test">Confirm delivery</a>')

    // `href=` survives as inert text; what matters is that no angle bracket or
    // quote is left for a parser to treat as markup.
    expect(escaped).not.toMatch(/[<>"']/)
    expect(escaped).toBe(
      '&lt;a href=&quot;https://evil.test&quot;&gt;Confirm delivery&lt;/a&gt;',
    )
  })

  it('escapes the ampersand first so entities are not double-decoded', () => {
    // Escaping & last would turn a literal "&lt;" into a working "<".
    expect(escapeHtml('&lt;script&gt;')).toBe('&amp;lt;script&amp;gt;')
  })

  it('covers both quote styles, which matters inside an attribute', () => {
    expect(escapeHtml(`" onmouseover='alert(1)'`)).toBe(
      '&quot; onmouseover=&#39;alert(1)&#39;',
    )
  })

  it('renders null and undefined as empty rather than the words', () => {
    expect(escapeHtml(null)).toBe('')
    expect(escapeHtml(undefined)).toBe('')
  })

  it('leaves ordinary text alone', () => {
    expect(escapeHtml('Heavy Canvas Tote — EU 40')).toBe('Heavy Canvas Tote — EU 40')
  })
})
