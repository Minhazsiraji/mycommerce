import type { Route } from 'next'
import Link from 'next/link'

import { buttonClassName } from '@/components/ui/button'

export function HomepageHero({ hasCategories }: { hasCategories: boolean }) {
  const primary = hasCategories
    ? { label: 'Browse categories', href: '#categories' }
    : { label: 'Search products', href: '/search' }

  return (
    <section aria-labelledby="homepage-title" className="relative isolate overflow-hidden rounded-(--radius-2xl) border border-(--border-subtle) bg-(--surface-primary) shadow-(--shadow-1)">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-(image:--gradient-brand-soft)" />
      <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-300/15" />

      <div className="relative grid min-h-[32rem] items-center gap-10 px-6 py-10 sm:px-10 md:min-h-[34rem] md:grid-cols-12 md:py-14 lg:px-14">
        <div className="flex flex-col items-start md:col-span-7">
          <h1 id="homepage-title" className="max-w-[12ch] text-[clamp(2.5rem,2rem+2.5vw,4rem)] leading-[1.06] font-semibold tracking-(--tracking-tight) text-balance">
            Smarter everyday shopping for modern life in Bangladesh.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-(--text-secondary) sm:text-lg sm:leading-8">
            Browse practical products with clear prices and a simple shopping experience built for Bangladesh.
          </p>
          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href={primary.href as Route}
              className={buttonClassName({ size: 'hero', className: 'w-full sm:w-auto' })}
            >
              {primary.label}
              <ArrowIcon />
            </Link>
            {hasCategories ? (
              <Link
                href="/search"
                className={buttonClassName({
                  variant: 'secondary',
                  size: 'hero',
                  className: 'w-full sm:w-auto',
                })}
              >
                Search products
              </Link>
            ) : null}
          </div>
        </div>

        <div aria-hidden="true" className="relative mx-auto flex aspect-[4/5] w-full max-w-sm items-center justify-center md:col-span-5">
          <div className="absolute inset-[8%] rotate-3 rounded-[30%_55%_32%_58%] border border-white/50 bg-white/35 shadow-(--shadow-2) backdrop-blur-xl dark:border-white/15 dark:bg-white/5" />
          <div className="absolute inset-[19%_8%_11%_22%] -rotate-6 rounded-[52%_30%_58%_35%] border border-indigo-200/80 bg-indigo-200/25 backdrop-blur-2xl dark:border-indigo-300/20 dark:bg-indigo-300/10" />
          <div className="relative flex size-36 items-center justify-center rounded-(--radius-2xl) border border-white/70 bg-white/55 shadow-(--shadow-2) backdrop-blur-xl dark:border-white/20 dark:bg-white/8">
            <span className="text-3xl font-bold tracking-(--tracking-tight) text-(--text-primary)">
              Siraji<span className="text-(--action-primary)">BD</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-4">
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  )
}
