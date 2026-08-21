'use client'

import type { Route } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'

import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { formatBdt } from '@/lib/money'
import { countryPreset } from '@/lib/country-presets'
import { ratesForDistrict } from '@/lib/shipping-rate-selection'
import { STORE_CONFIG } from '@/lib/store-config'
import { calculateOrderTotals, showsTaxLine, taxLineLabel } from '@/lib/tax'

const PRESET = countryPreset(STORE_CONFIG.countryCode)

const PAYMENT_LABELS: Record<CheckoutPaymentMethod, { title: string; detail: string }> = {
  cod: {
    title: 'Cash on delivery',
    detail: 'Pay the courier when your order arrives.',
  },
  bank_transfer: {
    title: 'Bank transfer',
    detail: 'Transfer to our account, then send us the reference. We confirm within a day.',
  },
  sslcommerz: {
    title: 'Card, bKash, Nagad or Rocket',
    detail: 'Pay securely through SSLCommerz.',
  },
}
import {
  BD_DISTRICTS,
  bdAreasFor,
  bdCitiesFor,
  canonicalBdArea,
  canonicalBdCity,
} from '@/lib/bd-locations'
import { InitiateCheckoutTracker } from '@/modules/meta/components/event-trackers'
import type { MetaCustomData } from '@/modules/meta/components/client'

import { placeOrder } from '../actions'
import type { CheckoutPaymentMethod } from '../payment-methods'

export type CheckoutRate = {
  id: string
  name: string
  description: string | null
  cost: number
  freeOverSubtotal: number | null
  districts: string[]
  estimatedDaysMin: number
  estimatedDaysMax: number
}

export type CheckoutDefaults = {
  email: string
  recipient: string
  phone: string
  line1: string
  line2: string
  city: string
  district: string
  upazila: string
  union: string
  postalCode: string
}

export function CheckoutForm({
  subtotal,
  tracking,
  rates,
  defaults,
  signedIn,
  paymentMethods,
}: {
  subtotal: number
  tracking: MetaCustomData
  rates: CheckoutRate[]
  defaults: CheckoutDefaults
  signedIn: boolean
  /** Only what this deployment has credentials for; the server checks again. */
  paymentMethods: CheckoutPaymentMethod[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string>()

  const [district, setDistrict] = useState(defaults.district)
  const initialCity = canonicalBdCity(defaults.district, defaults.city)
  const [city, setCity] = useState(initialCity)
  const [upazila, setUpazila] = useState(
    canonicalBdArea(defaults.district, initialCity, defaults.upazila),
  )
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>(
    paymentMethods[0] ?? 'cod',
  )

  const isBdModel = PRESET.addressModel === 'bd-administrative'

  const cities = useMemo(() => bdCitiesFor(district), [district])
  const areas = useMemo(() => bdAreasFor(district, city), [district, city])

  const regionRequired = PRESET.fields.region === 'required'

  /**
   * Filtered client-side from rates already sent, rather than re-fetching on
   * every district change. The server re-quotes authoritatively inside the
   * order transaction, so this is presentation only — it can be wrong without
   * being dangerous.
   */
  const available = useMemo(() => {
    return ratesForDistrict(rates, district, { regionRequired }).map((rate) => ({
      ...rate,
      isFree: rate.freeOverSubtotal !== null && subtotal >= rate.freeOverSubtotal,
    }))
  }, [rates, district, subtotal, regionRequired])

  const [rateId, setRateId] = useState(available[0]?.id ?? '')
  const selectedRate = available.find((r) => r.id === rateId) ?? available[0]
  const shippingCost = selectedRate ? (selectedRate.isFree ? 0 : selectedRate.cost) : 0

  // Same function the order transaction uses, so the figure shown here and the
  // amount charged cannot be arrived at two different ways.
  const totals = calculateOrderTotals({ subtotal, shippingCost }, STORE_CONFIG.tax)

  async function onSubmit(formData: FormData) {
    setErrors({})
    setFormError(undefined)

    startTransition(async () => {
      const result = await placeOrder({
        email: String(formData.get('email') ?? ''),
        address: {
          recipient: String(formData.get('recipient') ?? ''),
          phone: String(formData.get('phone') ?? ''),
          line1: String(formData.get('line1') ?? ''),
          line2: String(formData.get('line2') ?? ''),
          // The Bangladeshi model drives its three fields from linked selects,
          // so their values live in state; the generic model is plain inputs.
          city: isBdModel ? city : String(formData.get('city') ?? ''),
          district: isBdModel ? district : String(formData.get('district') ?? ''),
          upazila: isBdModel ? upazila : '',
          union: String(formData.get('union') ?? ''),
          postalCode: String(formData.get('postalCode') ?? ''),
          country: STORE_CONFIG.countryCode,
        },
        shippingRateId: selectedRate?.id ?? '',
        paymentMethod,
        notes: String(formData.get('notes') ?? ''),
        saveAddress: signedIn,
      })

      if (!result.ok) {
        setErrors(result.error.fields ?? {})
        setFormError(result.error.message)
        return
      }

      router.push(`/orders/${result.data.orderNumber}` as Route)
    })
  }

  const field = (name: string) => errors[name] ?? errors[`address.${name}`]

  return (
    <form action={onSubmit} className="grid gap-10 lg:grid-cols-[1fr_340px]" noValidate>
      <InitiateCheckoutTracker data={tracking} />
      <div className="flex flex-col gap-8">
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-(--color-muted)">Contact</h2>
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={defaults.email}
            required
            error={errors.email}
          />
          <p className="-mt-2 text-xs text-(--color-muted)">
            Your order confirmation goes here.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-(--color-muted)">Delivery address</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Full name"
              name="recipient"
              autoComplete="name"
              defaultValue={defaults.recipient}
              required
              error={field('recipient')}
            />
            <Input
              label="Mobile number"
              name="phone"
              type="tel"
              inputMode="tel"
              placeholder="01712345678"
              autoComplete="tel"
              defaultValue={defaults.phone}
              required
              error={field('phone')}
            />
          </div>

          <Input
            label="House, road, area"
            name="line1"
            autoComplete="address-line1"
            defaultValue={defaults.line1}
            required
            error={field('line1')}
          />
          <Input
            label="Landmark (optional)"
            name="line2"
            autoComplete="address-line2"
            defaultValue={defaults.line2}
            error={field('line2')}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            {!isBdModel ? (
              <>
                <Input
                  label={PRESET.labels.city}
                  name="city"
                  autoComplete="address-level2"
                  defaultValue={defaults.city}
                  required
                  error={field('city')}
                />
                <Input
                  label={`${PRESET.labels.region}${PRESET.fields.region === 'optional' ? ' (optional)' : ''}`}
                  name="district"
                  autoComplete="address-level1"
                  defaultValue={defaults.district}
                  onChange={(event) => setDistrict(event.target.value)}
                  error={field('district')}
                />
                <Input
                  label={PRESET.labels.postalCode}
                  name="postalCode"
                  autoComplete="postal-code"
                  defaultValue={defaults.postalCode}
                  required={PRESET.fields.postalCode === 'required'}
                  error={field('postalCode')}
                />
              </>
            ) : (
            <>
            <Select
              label={PRESET.labels.region}
              name="district"
              value={district}
              onChange={(event) => {
                setDistrict(event.target.value)
                setCity('')
                setUpazila('')
              }}
              error={field('district')}
            >
              <option value="">Select…</option>
              {BD_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
            <Select
              label="City / Town"
              name="city"
              autoComplete="address-level2"
              value={city}
              disabled={!district}
              onChange={(event) => {
                setCity(event.target.value)
                setUpazila('')
              }}
              required
              error={field('city')}
            >
              <option value="">{district ? 'Select…' : 'Select district first'}</option>
              {cities.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </Select>
            <Select
              label={PRESET.labels.area}
              name="upazila"
              autoComplete="address-level3"
              value={upazila}
              disabled={!city}
              onChange={(event) => setUpazila(event.target.value)}
              required
              error={field('upazila')}
            >
              <option value="">{city ? 'Select…' : 'Select city or town first'}</option>
              {areas.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </Select>
            <Input
              label="Union / Area (optional)"
              name="union"
              defaultValue={defaults.union}
              error={field('union')}
            />
            <Input
              label={`${PRESET.labels.postalCode} (optional)`}
              name="postalCode"
              inputMode="numeric"
              autoComplete="postal-code"
              defaultValue={defaults.postalCode}
              error={field('postalCode')}
            />
            </>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-(--color-muted)">Delivery option</h2>

          {available.length === 0 ? (
            <p className="rounded-md bg-(--color-danger)/10 px-3 py-2 text-sm text-(--color-danger)">
              {district || !regionRequired
                ? `No delivery option covers that ${PRESET.labels.region.toLowerCase()} yet.`
                : `Choose a ${PRESET.labels.region.toLowerCase()} to see delivery options.`}
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {available.map((rate) => (
                <label
                  key={rate.id}
                  className={`storefront-card-soft flex cursor-pointer items-center gap-3 p-4 text-sm ${
                    rate.id === selectedRate?.id
                      ? 'border-(--color-accent) bg-(--color-accent)/5'
                      : 'border-(--color-border)'
                  }`}
                >
                  <input
                    type="radio"
                    name="rate"
                    checked={rate.id === selectedRate?.id}
                    onChange={() => setRateId(rate.id)}
                  />
                  <span className="flex-1">
                    <span className="font-medium">{rate.name}</span>
                    <span className="block text-xs text-(--color-muted)">
                      {rate.estimatedDaysMin}–{rate.estimatedDaysMax} days
                    </span>
                  </span>
                  <span className="tabular-nums">
                    {rate.isFree ? (
                      <span className="text-(--color-success)">Free</span>
                    ) : (
                      formatBdt(rate.cost)
                    )}
                  </span>
                </label>
              ))}
            </div>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-(--color-muted)">Payment</h2>

          {paymentMethods.map((method) => (
            <label
              key={method}
              className={`storefront-card-soft flex cursor-pointer items-start gap-3 p-4 text-sm ${
                paymentMethod === method
                  ? 'border-(--color-accent) bg-(--color-accent)/5'
                  : 'border-(--color-border)'
              }`}
            >
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === method}
                onChange={() => setPaymentMethod(method)}
                className="mt-0.5"
              />
              <span>
                <span className="font-medium">{PAYMENT_LABELS[method].title}</span>
                <span className="block text-xs text-(--color-muted)">
                  {PAYMENT_LABELS[method].detail}
                </span>
              </span>
            </label>
          ))}
        </section>

        <Textarea
          label="Order notes (optional)"
          name="notes"
          rows={3}
          placeholder="Anything the courier should know"
          error={errors.notes}
        />
      </div>

      <aside className="storefront-card flex h-fit flex-col gap-4 p-5 lg:sticky lg:top-6">
        <h2 className="text-sm font-semibold">Order total</h2>

        <div className="flex justify-between text-sm">
          <span className="text-(--color-muted)">Subtotal</span>
          <span className="tabular-nums">{formatBdt(subtotal)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-(--color-muted)">Delivery</span>
          <span className="tabular-nums">
            {selectedRate ? (shippingCost === 0 ? 'Free' : formatBdt(shippingCost)) : '—'}
          </span>
        </div>

        {showsTaxLine(STORE_CONFIG.tax, totals.taxAmount) ? (
          <div className="flex justify-between text-sm">
            <span className="text-(--color-muted)">
              {taxLineLabel(STORE_CONFIG.tax)}
              {STORE_CONFIG.tax.mode === 'inclusive' ? ' — included' : null}
            </span>
            <span className="tabular-nums">{formatBdt(totals.taxAmount)}</span>
          </div>
        ) : null}

        <div className="flex justify-between border-t border-(--color-border) pt-3 text-base font-semibold">
          <span>Total</span>
          <span className="tabular-nums">{formatBdt(totals.total)}</span>
        </div>

        {/* Shown because the figure above is computed in the browser. The
            server recomputes every amount inside the order transaction, and
            that result is what the customer is charged. */}
        <p className="text-xs text-(--color-muted)">
          Confirmed by us before payment is taken.
        </p>

        {formError ? (
          <p role="alert" className="rounded-md bg-(--color-danger)/10 px-3 py-2 text-sm text-(--color-danger)">
            {formError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending || !selectedRate}
          className="h-11 rounded-md bg-(--color-accent) text-sm font-medium text-(--color-accent-fg) transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? 'Placing order…' : 'Place order'}
        </button>

        <p className="text-xs leading-5 text-(--color-muted)">
          By placing your order, you agree to the{' '}
          <Link className="underline underline-offset-2 hover:text-(--text-primary)" href="/terms">
            Terms & Conditions
          </Link>{' '}
          and acknowledge the{' '}
          <Link className="underline underline-offset-2 hover:text-(--text-primary)" href="/returns">
            Returns & Refunds
          </Link>
          ,{' '}
          <Link className="underline underline-offset-2 hover:text-(--text-primary)" href="/shipping">
            Shipping & Delivery
          </Link>{' '}
          and{' '}
          <Link className="underline underline-offset-2 hover:text-(--text-primary)" href="/privacy">
            Privacy Policy
          </Link>
          .
        </p>
      </aside>
    </form>
  )
}
