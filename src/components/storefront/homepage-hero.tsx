import type { Route } from 'next'
import Link from 'next/link'

import { buttonClassName } from '@/components/ui/button'

type HomepageHeroSettings = {
  heroTitle: string
  heroDescription: string
  heroPrimaryLabel: string
  heroPrimaryHref: string
  heroSecondaryLabel: string
  heroSecondaryHref: string
  heroBrandText: string
  heroBrandAccent: string
}

export function HomepageHero({
  hasCategories,
  settings,
}: {
  hasCategories: boolean
  settings: HomepageHeroSettings
}) {
  const primary = !hasCategories && settings.heroPrimaryHref === '#categories'
    ? { label: 'Search products', href: '/search' }
    : { label: settings.heroPrimaryLabel, href: settings.heroPrimaryHref }

  return (
    <section aria-labelledby="homepage-title" className="relative isolate overflow-hidden rounded-(--radius-2xl) border border-(--border-subtle) bg-(--surface-primary) shadow-(--shadow-1)">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-(image:--gradient-brand-soft)" />
      <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-300/15" />

      <div className="relative grid items-center gap-6 px-6 py-8 sm:px-10 sm:py-10 md:min-h-[26rem] md:grid-cols-12 md:gap-8 md:py-10 lg:px-14">
        <div className="flex flex-col items-start md:col-span-7">
          <h1 id="homepage-title" className="max-w-[13ch] text-[clamp(2.25rem,1.9rem+1.75vw,3.5rem)] leading-[1.06] font-semibold tracking-(--tracking-tight) text-balance">
            {settings.heroTitle}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-(--text-secondary) sm:text-lg sm:leading-8">
            {settings.heroDescription}
          </p>
          <div className="mt-6 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href={primary.href as Route}
              className={buttonClassName({ size: 'hero', className: 'w-full sm:w-auto' })}
            >
              {primary.label}
              <ArrowIcon />
            </Link>
            {hasCategories ? (
              <Link
                href={settings.heroSecondaryHref as Route}
                className={buttonClassName({
                  variant: 'secondary',
                  size: 'hero',
                  className: 'w-full sm:w-auto',
                })}
              >
                {settings.heroSecondaryLabel}
              </Link>
            ) : null}
          </div>
        </div>

        <div aria-hidden="true" className="relative mx-auto flex aspect-square w-full max-w-56 items-center justify-center sm:max-w-64 md:col-span-5 md:max-w-72">
          <div className="absolute inset-[8%] rotate-3 rounded-[30%_55%_32%_58%] border border-white/50 bg-white/35 shadow-(--shadow-2) backdrop-blur-xl dark:border-white/15 dark:bg-white/5" />
          <div className="absolute inset-[19%_8%_11%_22%] -rotate-6 rounded-[52%_30%_58%_35%] border border-indigo-200/80 bg-indigo-200/25 backdrop-blur-2xl dark:border-indigo-300/20 dark:bg-indigo-300/10" />
          <div className="relative flex size-28 items-center justify-center rounded-(--radius-2xl) border border-white/70 bg-white/55 shadow-(--shadow-2) backdrop-blur-xl sm:size-32 dark:border-white/20 dark:bg-white/8">
            <span className="text-2xl font-bold tracking-(--tracking-tight) text-(--text-primary) sm:text-3xl">
              {settings.heroBrandText}
              {settings.heroBrandAccent ? (
                <span className="text-(--action-primary)">{settings.heroBrandAccent}</span>
              ) : null}
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
