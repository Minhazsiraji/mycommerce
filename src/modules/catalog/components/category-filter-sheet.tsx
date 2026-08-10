'use client'

import { useRef } from 'react'

export function CategoryFilterSheet({ children, selectedCount }: { children: React.ReactNode; selectedCount: number }) {
  const dialog = useRef<HTMLDialogElement>(null)

  return (
    <div className="lg:hidden">
      <button type="button" onClick={() => dialog.current?.showModal()} className="min-h-11 rounded-(--radius-md) border border-(--border-strong) bg-(--surface-primary)/80 px-4 text-sm font-medium shadow-(--shadow-1) backdrop-blur-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)">
        Filters{selectedCount ? ` (${selectedCount})` : ''}
      </button>
      <dialog ref={dialog} aria-labelledby="category-filter-title" onClick={(event) => { if (event.target === dialog.current) dialog.current?.close() }} className="m-0 ml-auto h-dvh max-h-none w-(--drawer-width) max-w-none bg-(--surface-elevated) p-0 text-(--text-primary) shadow-(--shadow-3) backdrop:bg-(--background-scrim)">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b p-5">
            <h2 id="category-filter-title" className="text-lg font-semibold">Filters</h2>
            <button type="button" onClick={() => dialog.current?.close()} className="min-h-11 min-w-11 rounded-(--radius-md) text-xl focus-visible:outline-2 focus-visible:outline-(--focus-ring)" aria-label="Close filters">×</button>
          </div>
          <div className="overflow-y-auto p-5">{children}</div>
        </div>
      </dialog>
    </div>
  )
}
