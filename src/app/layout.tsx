import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { ThemeScript } from '@/components/theme-script'
import { getSiteUrl, isIndexableEnvironment } from '@/lib/site-metadata'
import { STORE_CONFIG } from '@/lib/store-config'

import './globals.css'

// Self-hosted by next/font — no render-blocking request to an external origin,
// and no layout shift when the face loads. See docs/05-performance.md.
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const siteDescription = STORE_CONFIG.defaultDescription
const defaultTitle = `${STORE_CONFIG.name} | Smarter Everyday Shopping in ${STORE_CONFIG.countryName}`

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: defaultTitle,
    template: `%s | ${STORE_CONFIG.name}`,
  },
  description: siteDescription,
  alternates: { canonical: '/' },
  robots: {
    index: isIndexableEnvironment(),
    follow: isIndexableEnvironment(),
  },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: STORE_CONFIG.name,
    title: defaultTitle,
    description: siteDescription,
  },
  twitter: {
    card: 'summary',
    title: defaultTitle,
    description: siteDescription,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the inline script below sets `data-theme` on
    // this element before React hydrates, so the client tree legitimately
    // differs from the server's. It suppresses the warning on this element
    // only, not on anything inside it.
    <html lang={STORE_CONFIG.locale.split('-')[0]} className={inter.variable} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-dvh font-sans antialiased">{children}</body>
    </html>
  )
}
