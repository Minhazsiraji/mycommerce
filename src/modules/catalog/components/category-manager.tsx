'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

import { createCategory, deleteCategory, updateCategory } from '../actions'
import { slugify } from '../validators'

export type ManagedCategory = {
  id: string
  name: string
  slug: string
  parentId: string | null
  productCount: number
}

export function CategoryManager({ categories }: { categories: ManagedCategory[] }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [parentId, setParentId] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string>()
  const [pending, setPending] = useState(false)

  const tops = categories.filter((c) => !c.parentId)
  const childrenOf = (id: string) => categories.filter((c) => c.parentId === id)

  async function onCreate() {
    setErrors({})
    setFormError(undefined)
    setPending(true)

    try {
      const result = await createCategory({ name, slug, parentId: parentId || null, position: 0 })

      if (!result.ok) {
        setErrors(result.error.fields ?? {})
        setFormError(result.error.message)
        return
      }

      setName('')
      setSlug('')
      setSlugTouched(false)
      setParentId('')
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  async function onDelete(category: ManagedCategory) {
    if (!confirm(`Delete "${category.name}"?`)) return

    setFormError(undefined)
    const result = await deleteCategory(category.id)

    // The service refuses when products or sub-categories still reference it,
    // and that message is the useful part.
    if (!result.ok) setFormError(result.error.message)
    else router.refresh()
  }

  async function onRename(category: ManagedCategory) {
    const next = prompt('New name', category.name)
    if (!next || next === category.name) return

    const result = await updateCategory(category.id, {
      name: next,
      slug: category.slug,
      parentId: category.parentId,
      position: 0,
    })

    if (!result.ok) setFormError(result.error.message)
    else router.refresh()
  }

  const row = (c: ManagedCategory, depth: number) => (
    <li
      key={c.id}
      className="flex items-center justify-between gap-4 border-t border-(--color-border) px-4 py-3 text-sm"
      style={{ paddingLeft: `${16 + depth * 24}px` }}
    >
      <span>
        {c.name}
        <span className="ml-2 text-xs text-(--color-muted)">/{c.slug}</span>
      </span>
      <span className="flex items-center gap-3">
        <span className="text-xs text-(--color-muted)">
          {c.productCount} {c.productCount === 1 ? 'product' : 'products'}
        </span>
        <button
          type="button"
          onClick={() => onRename(c)}
          className="text-xs underline underline-offset-4"
        >
          Rename
        </button>
        <button
          type="button"
          onClick={() => onDelete(c)}
          className="text-xs text-(--color-danger) underline underline-offset-4"
        >
          Delete
        </button>
      </span>
    </li>
  )

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4 rounded-lg border border-(--color-border) p-5">
        <h2 className="text-sm font-semibold text-(--color-muted)">Add a category</h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (!slugTouched) setSlug(slugify(e.target.value))
            }}
            error={errors.name}
          />
          <Input
            label="Slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value)
              setSlugTouched(true)
            }}
            error={errors.slug}
          />
          <Select
            label="Parent"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            error={errors.parentId}
          >
            <option value="">None (top level)</option>
            {tops.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        <Button
          type="button"
          className="self-start"
          disabled={pending || !name || !slug}
          onClick={onCreate}
        >
          {pending ? 'Adding…' : 'Add category'}
        </Button>

        {formError ? (
          <p role="alert" className="text-sm text-(--color-danger)">
            {formError}
          </p>
        ) : null}
      </section>

      {categories.length === 0 ? (
        <p className="rounded-lg border border-dashed border-(--color-border) px-6 py-12 text-center text-sm text-(--color-muted)">
          No categories yet. Products can exist without one.
        </p>
      ) : (
        <ul className="overflow-hidden rounded-lg border border-(--color-border)">
          {tops.flatMap((top) => [row(top, 0), ...childrenOf(top.id).map((c) => row(c, 1))])}
        </ul>
      )}
    </div>
  )
}
