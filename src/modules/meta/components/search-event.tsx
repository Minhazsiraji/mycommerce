'use client'

import { useEffect } from 'react'

import { emitMetaBrowserEvent, newBrowserEventId } from './client'

export function SearchEvent({ query }: { query: string }) {
  useEffect(() => {
    emitMetaBrowserEvent({
      eventName: 'Search',
      eventId: newBrowserEventId('search'),
      data: { search_string: query },
    })
  }, [query])

  return null
}
