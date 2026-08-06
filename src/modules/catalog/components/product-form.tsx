'use client'

import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { formatBdtPlain } from '@/lib/money'

import { createProduct, updateProduct } from '../actions'
import { slugify } from '../validators'

type VariantRow = {
  id?: string
  sku: string
  title: string
  price: string
  compareAtPrice: string
  stock: string
  weightGrams: string
}

export type ProductFormInitial = {
  id: string
  title: string
  slug: string
  description: string | null
  brand: string | null
  keywords: string | null
  categoryId: string | null
  status: string
  variants: {
    id: string
    sku: string
    title: string | null
    price: number
    compareAtPrice: number | null
    stock: number
    weightGrams: number
  }[]
}

const emptyRow = (): VariantRow => ({
  sku: '',
  title: '',
  price: '',
  compareAtPrice: '',
  stock: '0',
  weightGrams: '0',
})

function toRows(initial?: ProductFormInitial): VariantRow[] {
  if (!initial?.variants.length) return [emptyRow()]

  return initial.variants.map((v) => ({
    id: v.id,
    sku: v.sku,
    title: v.title ?? '',
    price: formatBdtPlain(v.price),
    compareAtPrice: v.compareAtPrice == null ? '' : formatBdtPlain(v.compareAtPrice),
    stock: String(v.stock),
    weightGrams: String(v.weightGrams),
  }))
}

export function ProductForm({
  categories,
  initial,
}: {
  categories: { id: string; name: string }[]
  initial?: ProductFormInitial
}) {
  const router = useRouter()
  const isEdit = Boolean(initial)

  const [title, setTitle] = useState(initial?.title ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(isEdit)
  const [rows, setRows] = useState<VariantRow[]>(toRows(initial))

  /**
   * Most products have no size or colour, so the variant table stays hidden and
   * the single row is edited as plain price/stock fields. Making every simple
   * product fill in a table is friction for nothing.
   */
  const [hasOptions, setHasOptions] = useState((initial?.variants.length ?? 1) > 1)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string>()
  const [pending, setPending] = useState(false)

  const setRow = (index: number, patch: Partial<VariantRow>) =>
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)))

  async function onSubmit(formData: FormData) {
    setErrors({})
    setFormError(undefined)
    setPending(true)

    try {
      const input = {
        title: String(formData.get('title') ?? ''),
        slug: String(formData.get('slug') ?? ''),
        description: String(formData.get('description') ?? ''),
        brand: String(formData.get('brand') ?? ''),
      keywords: String(formData.get('keywords') ?? ''),
        categoryId: String(formData.get('categoryId') ?? '') || null,
        status: String(formData.get('status') ?? 'draft'),
        variants: (hasOptions ? rows : rows.slice(0, 1)).map((r) => ({
          ...(r.id ? { id: r.id } : {}),
          sku: r.sku,
          title: hasOptions ? r.title : '',
          price: r.price,
          compareAtPrice: r.compareAtPrice,
          stock: r.stock,
          weightGrams: r.weightGrams,
          options: {},
        })),
      }

      const result = initial
        ? await updateProduct(initial.id, input)
        : await createProduct(input)

      if (!result.ok) {
        setErrors(result.error.fields ?? {})
        setFormError(result.error.message)
        return
      }

      // On create there is no product id until now, so images are managed on
      // the edit screen — send the user straight there.
      router.push(`/admin/products/${result.data.id}` as Route)
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  const variantError = (i: number, field: string) =>
    errors[`variants.${i}.${field}`] ?? (i === 0 ? errors[`variants.${field}`] : undefined)

  return (
    <form action={onSubmit} className="flex flex-col gap-8" noValidate>
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-(--color-muted)">Details</h2>

        <Input
          label="Title"
          name="title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            if (!slugTouched) setSlug(slugify(e.target.value))
          }}
          required
          error={errors.title}
        />

        <Input
          label="Slug"
          name="slug"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value)
            setSlugTouched(true)
          }}
          required
          error={errors.slug}
        />

        <Textarea
          label="Description"
          name="description"
          defaultValue={initial?.description ?? ''}
          error={errors.description}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Brand"
            name="brand"
            defaultValue={initial?.brand ?? ''}
            error={errors.brand}
          />
          <Select
            label="Category"
            name="categoryId"
            defaultValue={initial?.categoryId ?? ''}
            error={errors.categoryId}
          >
            <option value="">None</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Select
            label="Status"
            name="status"
            defaultValue={initial?.status ?? 'draft'}
            error={errors.status}
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </Select>
        </div>

        <Input
          label="Search keywords"
          name="keywords"
          defaultValue={initial?.keywords ?? ''}
          placeholder="shoes, sneakers, trainers"
          error={errors.keywords}
        />
        <p className="-mt-2 text-xs text-(--color-muted)">
          Words customers might search for that are not in the title. A boot is found by
          &ldquo;shoes&rdquo; only if you put it here. The category name already works on its own.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-(--color-muted)">
            {hasOptions ? 'Variants' : 'Price and stock'}
          </h2>
          <button
            type="button"
            className="text-sm underline underline-offset-4"
            onClick={() => {
              if (hasOptions && rows.length > 1) {
                if (!confirm('Remove all but the first variant?')) return
                setRows((prev) => prev.slice(0, 1))
              }
              setHasOptions(!hasOptions)
            }}
          >
            {hasOptions ? 'Use a single option' : 'Add options (sizes, colours…)'}
          </button>
        </div>

        {!hasOptions ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="SKU"
              value={rows[0]?.sku ?? ''}
              onChange={(e) => setRow(0, { sku: e.target.value })}
              required
              error={variantError(0, 'sku')}
            />
            <Input
              label="Price (৳)"
              inputMode="decimal"
              value={rows[0]?.price ?? ''}
              onChange={(e) => setRow(0, { price: e.target.value })}
              required
              error={variantError(0, 'price')}
            />
            <Input
              label="Compare-at price (৳)"
              inputMode="decimal"
              placeholder="Optional"
              value={rows[0]?.compareAtPrice ?? ''}
              onChange={(e) => setRow(0, { compareAtPrice: e.target.value })}
              error={variantError(0, 'compareAtPrice')}
            />
            <Input
              label="Stock"
              inputMode="numeric"
              value={rows[0]?.stock ?? '0'}
              onChange={(e) => setRow(0, { stock: e.target.value })}
              required
              error={variantError(0, 'stock')}
            />
            <Input
              label="Weight (grams)"
              inputMode="numeric"
              value={rows[0]?.weightGrams ?? '0'}
              onChange={(e) => setRow(0, { weightGrams: e.target.value })}
              error={variantError(0, 'weightGrams')}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {rows.map((row, i) => (
              <div
                key={row.id ?? `new-${i}`}
                className="grid gap-3 rounded-lg border border-(--color-border) p-4 sm:grid-cols-6"
              >
                <Input
                  label="Option"
                  placeholder="e.g. Size 9"
                  value={row.title}
                  onChange={(e) => setRow(i, { title: e.target.value })}
                  error={variantError(i, 'title')}
                />
                <Input
                  label="SKU"
                  value={row.sku}
                  onChange={(e) => setRow(i, { sku: e.target.value })}
                  error={variantError(i, 'sku')}
                />
                <Input
                  label="Price (৳)"
                  inputMode="decimal"
                  value={row.price}
                  onChange={(e) => setRow(i, { price: e.target.value })}
                  error={variantError(i, 'price')}
                />
                <Input
                  label="Compare-at"
                  inputMode="decimal"
                  value={row.compareAtPrice}
                  onChange={(e) => setRow(i, { compareAtPrice: e.target.value })}
                  error={variantError(i, 'compareAtPrice')}
                />
                <Input
                  label="Stock"
                  inputMode="numeric"
                  value={row.stock}
                  onChange={(e) => setRow(i, { stock: e.target.value })}
                  error={variantError(i, 'stock')}
                />
                <div className="flex flex-col justify-end gap-1.5">
                  <Input
                    label="Weight (g)"
                    inputMode="numeric"
                    value={row.weightGrams}
                    onChange={(e) => setRow(i, { weightGrams: e.target.value })}
                    error={variantError(i, 'weightGrams')}
                  />
                  {rows.length > 1 ? (
                    <button
                      type="button"
                      className="text-left text-xs text-(--color-danger) underline underline-offset-4"
                      onClick={() => setRows((prev) => prev.filter((_, j) => j !== i))}
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="ghost"
              className="self-start"
              onClick={() => setRows((prev) => [...prev, emptyRow()])}
            >
              Add variant
            </Button>
          </div>
        )}

        {errors.variants ? (
          <p className="text-sm text-(--color-danger)">{errors.variants}</p>
        ) : null}
      </section>

      {formError ? (
        <p role="alert" className="text-sm text-(--color-danger)">
          {formError}
        </p>
      ) : null}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving…' : isEdit ? 'Save changes' : 'Create product'}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push('/admin/products')}>
          Cancel
        </Button>
      </div>

      {!isEdit ? (
        <p className="text-sm text-(--color-muted)">
          Images can be added once the product exists — you will land on the edit screen after
          saving.
        </p>
      ) : null}
    </form>
  )
}
