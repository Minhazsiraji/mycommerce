'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { signOut } from '../auth-client'

export function SignOutButton() {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  return (
    <Button
      variant="ghost"
      className="self-start"
      disabled={pending}
      onClick={async () => {
        setPending(true)
        await signOut()
        router.push('/')
        router.refresh()
      }}
    >
      {pending ? 'Signing out…' : 'Sign out'}
    </Button>
  )
}
