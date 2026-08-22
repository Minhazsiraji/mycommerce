import { PolicyPage } from '@/components/storefront/policy-page'

import type { PolicyPage as PolicyPageRow } from '../schema'
import { policyParagraphs } from '../validators'

/**
 * Renders a client-authored policy in place of the bundled one.
 *
 * The body goes through JSX as text, never `dangerouslySetInnerHTML` — React
 * escapes it, so a policy page cannot become a script-injection surface for
 * whoever holds the admin account.
 */
export function PolicyOverride({ page }: { page: PolicyPageRow }) {
  const paragraphs = policyParagraphs(page.body)

  return (
    <PolicyPage
      title={page.title}
      summary={page.summary}
      sections={[
        {
          title: page.title,
          body: (
            <>
              {paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </>
          ),
        },
      ]}
    />
  )
}
