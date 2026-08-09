'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

type NavigationItem = {
  id: string
  slug: string
  name: string
}

export function MobileNavigation({ categories }: { categories: NavigationItem[] }) {
  const [open, setOpen] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()

    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  function handleClose() {
    setOpen(false)
    requestAnimationFrame(() => triggerRef.current?.focus())
  }

  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="inline-flex size-11 items-center justify-center rounded-(--radius-md) text-(--text-secondary) transition-colors hover:bg-(--surface-secondary) hover:text-(--text-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
      >
        <span className="sr-only">Menu</span>
        <MenuIcon />
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="mobile-navigation-title"
        onClose={handleClose}
        onClick={(event) => {
          if (event.target === event.currentTarget) handleClose()
        }}
        className="m-0 h-dvh max-h-none w-(--drawer-width) max-w-none overflow-y-auto border-0 border-r border-(--border-subtle) bg-(--surface-primary) p-0 text-(--text-primary) shadow-(--shadow-3) backdrop:bg-(--background-scrim)"
      >
        <div className="flex min-h-full flex-col px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <div className="flex min-h-14 items-center justify-between border-b border-(--border-subtle)">
            <h2 id="mobile-navigation-title" className="text-lg font-semibold tracking-(--tracking-heading)">
              Shop
            </h2>
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex size-11 items-center justify-center rounded-(--radius-md) text-(--text-secondary) transition-colors hover:bg-(--surface-secondary) hover:text-(--text-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
            >
              <span className="sr-only">Close menu</span>
              <CloseIcon />
            </button>
          </div>

          <nav aria-label="Mobile primary" className="py-5">
            <ul className="flex flex-col">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/c/${category.slug}`}
                    onClick={handleClose}
                    className="flex min-h-12 items-center justify-between border-b border-(--border-subtle) py-3 text-base font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
                  >
                    {category.name}
                    <ArrowIcon />
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/search"
                  onClick={handleClose}
                  className="flex min-h-12 items-center justify-between border-b border-(--border-subtle) py-3 text-base font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
                >
                  Search products
                  <ArrowIcon />
                </Link>
              </li>
            </ul>
          </nav>

          <div className="mt-auto flex flex-col gap-2 border-t border-(--border-subtle) pt-5 text-sm">
            <Link href="/orders/lookup" onClick={handleClose} className="flex min-h-11 items-center text-(--text-secondary) underline-offset-4 hover:underline">
              Track your order
            </Link>
            <Link href="/account" onClick={handleClose} className="flex min-h-11 items-center text-(--text-secondary) underline-offset-4 hover:underline">
              Account
            </Link>
          </div>
        </div>
      </dialog>
    </div>
  )
}

function MenuIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="size-5">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="size-5">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-4 text-(--text-muted)">
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
