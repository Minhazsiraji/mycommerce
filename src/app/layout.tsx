import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

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
    default: 'MyCommerce',
    template: '%s · MyCommerce',
  },
  description: 'A fast, secure online store.',
  robots: { index: false, follow: false }, // opened up at launch
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-dvh font-sans antialiased">{children}</body>
    </html>
  )
}
