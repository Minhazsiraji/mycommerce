import type { Metadata } from 'next'

import { KountryFeedDemo } from '@/components/kountry-feed-demo'

export const metadata: Metadata = {
  title: 'Kountry Feed · Personalized Commerce Demo',
  description: 'A private personalized commerce concept for Kountry Feed in Rwanda.',
  robots: { index: false, follow: false },
}

export default function KountryFeedDemoPage() {
  return <KountryFeedDemo />
}
