import 'server-only'

import { randomBytes } from 'node:crypto'

import { cookies } from 'next/headers'

import { env } from '@/lib/env'
import { getSession } from '@/modules/accounts'

import * as repo from './repository'
import type { CartLine } from './repository'
import { MAX_LINE_QUANTITY } from './validators'

export class CartError extends Error {}

const COOKIE_NAME = 'mycommerce_cart'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30

/**
 * The guest token is 32 random bytes, not a signed value.
 *
 * Signing protects a cookie whose *contents* the client might tamper with. Here
 * the token is the secret itself — there is nothing to forge, only something to
 * guess, and 256 bits is not guessable. httpOnly keeps it away from scripts.
 */
function newToken() {
  return randomBytes(32).toString('base64url')
}

export type CartView = {
  id: string | null
  lines: CartLine[]
  subtotal: number
  itemCount: number
  /** Something changed since the customer added it — price, stock or availability. */
  hasIssues: boolean
}

const EMPTY: CartView = { id: null, lines: [], subtotal: 0, itemCount: 0, hasIssues: false }

function summarise(id: string, lines: CartLine[]): CartView {
  return {
    id,
    lines,
    // Recomputed from live variant prices, never from the stored unit price.
    subtotal: lines.reduce((total, line) => total + line.lineTotal, 0),
    itemCount: lines.reduce((count, line) => count + line.quantity, 0),
    hasIssues: lines.some(
      (line) =>
        line.unavailable || line.availableStock < line.quantity || line.unitPrice !== line.addedPrice,
    ),
  }
}

/**
 * Render-safe read. Resolves an existing cart and never creates one, because a
 * Server Component cannot set a cookie — a cart created here would be orphaned
 * on the next request.
 */
export async function readCart(): Promise<CartView> {
  const session = await getSession()

  const cart = session
    ? await repo.findCartByUser(session.user.id)
    : await (async () => {
        const token = (await cookies()).get(COOKIE_NAME)?.value
        return token ? await repo.findCartBySession(token) : undefined
      })()

  if (!cart) return EMPTY
  return summarise(cart.id, await repo.listLines(cart.id))
}

/** Action-only: may set the guest cookie, so it must not run during render. */
export async function getOrCreateCart(): Promise<{ id: string }> {
  const session = await getSession()

  if (session) {
    const existing = await repo.findCartByUser(session.user.id)
    return existing ?? (await repo.createCart({ userId: session.user.id }))
  }

  const jar = await cookies()
  const token = jar.get(COOKIE_NAME)?.value

  if (token) {
    const existing = await repo.findCartBySession(token)
    if (existing) return existing
  }

  const fresh = newToken()
  const cart = await repo.createCart({ sessionToken: fresh })

  jar.set(COOKIE_NAME, fresh, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })

  return cart
}

export async function addToCart(input: { variantId: string; quantity: number }) {
  const variant = await repo.findPurchasableVariant(input.variantId)
  if (!variant) throw new CartError('That item is no longer available.')

  if (variant.stock < 1) throw new CartError('That item is out of stock.')

  const cart = await getOrCreateCart()

  /**
   * Capped at available stock as a courtesy, not as the guarantee. Stock can
   * change between here and checkout, so the authoritative check is the
   * conditional decrement inside the order transaction.
   */
  await repo.upsertLine({
    cartId: cart.id,
    variantId: variant.id,
    quantity: input.quantity,
    unitPrice: variant.price,
    cap: Math.min(MAX_LINE_QUANTITY, variant.stock),
  })

  return variant
}

/** Confirms the line belongs to the caller's cart before touching it. */
async function requireOwnedLine(lineId: string) {
  const line = await repo.findLine(lineId)
  if (!line) throw new CartError('That item is no longer in your cart.')

  const cart = await readCart()
  // Without this, any line id would be editable by anyone who guessed it.
  if (!cart.id || cart.id !== line.cartId) throw new CartError('That item is not in your cart.')

  return line
}

export async function updateLineQuantity(lineId: string, quantity: number) {
  const line = await requireOwnedLine(lineId)

  if (quantity === 0) {
    await repo.deleteLine(lineId)
    return
  }

  const variant = await repo.findPurchasableVariant(line.variantId)
  if (!variant) throw new CartError('That item is no longer available.')

  if (quantity > variant.stock) {
    throw new CartError(
      variant.stock === 0
        ? 'That item is now out of stock.'
        : `Only ${variant.stock} left — quantity reduced.`,
    )
  }

  await repo.setLineQuantity(lineId, quantity)
  await repo.touch(line.cartId)
}

export async function removeLine(lineId: string) {
  const line = await requireOwnedLine(lineId)
  await repo.deleteLine(lineId)
  await repo.touch(line.cartId)
}

/**
 * Called once after sign-in. A guest who filled a cart, then logged in, must not
 * lose it — that is a checkout abandoned at the last step.
 */
export async function mergeGuestCartIntoUser(userId: string) {
  const jar = await cookies()
  const token = jar.get(COOKIE_NAME)?.value
  if (!token) return

  const guestCart = await repo.findCartBySession(token)

  // Clear the cookie either way; the guest identity is spent once signed in.
  jar.delete(COOKIE_NAME)
  if (!guestCart) return

  const userCart = await repo.findCartByUser(userId)

  if (!userCart) {
    await repo.claimCart(guestCart.id, userId)
    return
  }

  if (guestCart.id === userCart.id) return
  await repo.mergeCarts(guestCart.id, userCart.id, MAX_LINE_QUANTITY)
}

export type { CartLine }
