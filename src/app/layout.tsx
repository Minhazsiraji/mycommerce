import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { ThemeScript } from '@/components/theme-script'

import './globals.css'

// Self-hosted by next/font — no render-blocking request to an external origin,
// and no layout shift when the face loads. See docs/05-performance.md.
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'SirajiBD',
    template: '%s · SirajiBD',
  },
  robots: { index: false, follow: false }, // opened up at launch
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the inline script below sets `data-theme` on
    // this element before React hydrates, so the client tree legitimately
    // differs from the server's. It suppresses the warning on this element
    // only, not on anything inside it.
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-dvh font-sans antialiased">{children}</body>
    </html>
  )
}
