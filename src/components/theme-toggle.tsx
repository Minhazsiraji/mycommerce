'use client'

import { useSyncExternalStore } from 'react'

type Theme = 'light' | 'dark'

/**
 * The theme lives on the document element, not in React state — the inline
 * script in <head> sets it before hydration, and the OS can change it
 * underneath us. That makes it external mutable state, which is exactly what
 * `useSyncExternalStore` is for. Reading it into `useState` inside an effect
 * would work but triggers a cascading render on every mount.
 */

const listeners = new Set<() => void>()

function notify() {
  for (const listener of listeners) listener()
}

function subscribe(onChange: () => void) {
  listeners.add(onChange)

  // Follow the OS while no explicit choice has been made.
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  media.addEventListener('change', onChange)

  return () => {
    listeners.delete(onChange)
    media.removeEventListener('change', onChange)
  }
}

function getSnapshot(): Theme {
  const attr = document.documentElement.getAttribute('data-theme')
  if (attr === 'light' || attr === 'dark') return attr
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** The server cannot know the visitor's choice, so it renders no icon at all. */
function getServerSnapshot(): Theme | null {
  return null
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  function toggle() {
    const next: Theme = getSnapshot() === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)

    try {
      localStorage.setItem('theme', next)
    } catch {
      // Private browsing can refuse writes. The theme still applies to this
      // page view; it just will not be remembered.
    }

    notify()
  }

  const label = theme ? `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode` : 'Switch theme'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      // Fixed size so nothing shifts when the icon resolves after hydration.
      className="inline-flex size-11 shrink-0 items-center justify-center rounded-(--radius-md) border border-(--border-subtle) text-(--text-secondary) transition-colors hover:border-(--border-strong) hover:bg-(--surface-secondary) hover:text-(--text-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
    >
      {theme === 'dark' ? <SunIcon /> : theme === 'light' ? <MoonIcon /> : null}
    </button>
  )
}

function SunIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  )
}
