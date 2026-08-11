'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/** Refresh a success-return page until the independently verified IPN is visible. */
export function PaymentStatusRefresh() {
  const router = useRouter()

  useEffect(() => {
    const timer = window.setInterval(() => router.refresh(), 1_500)
    return () => window.clearInterval(timer)
  }, [router])

  return null
}
