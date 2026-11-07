'use client'

import { useEffect } from 'react'

import { newBrowserEventId, trackBrowserEvent } from './client'

export function SearchEvent({ query }: { query: string }) {
  useEffect(() => {
    trackBrowserEvent('Search', { search_string: query }, newBrowserEventId('search'))
  }, [query])

  return null
}
