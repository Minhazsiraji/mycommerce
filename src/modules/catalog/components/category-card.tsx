import Image from 'next/image'
import Link from 'next/link'

import { storage } from '@/lib/storage'

export type CategoryCardData = {
  id: string
  slug: string
  name: string
  imageKey: string | null
}

export function CategoryCard({ category }: { category: CategoryCardData }) {
  return (
    <Link
      href={`/c/${category.slug}`}
      className="group flex h-full min-w-0 flex-col gap-3 rounded-(--radius-xl) border border-white/70 bg-(image:--gradient-brand-soft) p-2 shadow-(--shadow-1) backdrop-blur-[12px] transition-[transform,border-color,box-shadow] duration-(--duration-base) ease-(--ease-standard) hover:-translate-y-0.5 hover:border-(--border-interactive) hover:shadow-(--shadow-2) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--focus-ring) motion-reduce:transform-none sm:p-3 dark:border-white/20"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-(--radius-lg) border border-(--border-subtle) bg-(--surface-secondary)">
        {category.imageKey ? (
          <Image
            src={storage.url(category.imageKey, { width: 560, height: 700, fit: 'cover' })}
            alt=""
            fill
            sizes="(max-width: 639px) calc(50vw - 24px), (max-width: 1023px) calc(50vw - 36px), 264px"
            className="object-cover"
          />
        ) : (
          <div aria-hidden="true" className="absolute inset-0 bg-(image:--gradient-brand-soft)">
            <div className="absolute -right-10 -bottom-8 size-40 rounded-full border border-indigo-300/30 bg-indigo-300/20 blur-xl dark:bg-indigo-300/10" />
            <div className="absolute top-8 left-6 size-16 rounded-(--radius-xl) border border-white/60 bg-white/35 shadow-(--shadow-1) backdrop-blur-lg dark:border-white/15 dark:bg-white/5" />
          </div>
        )}
      </div>
      <div className="flex h-[4.75rem] items-start px-1 pb-1 sm:h-[5.25rem]">
        <h3 className="line-clamp-2 text-sm font-semibold text-(--text-primary) underline-offset-4 group-hover:underline sm:text-base">
          {category.name}
        </h3>
      </div>
    </Link>
  )
}
