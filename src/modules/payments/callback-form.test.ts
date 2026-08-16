import { describe, expect, it } from 'vitest'

import { CallbackPayloadTooLarge, readCallbackForm } from './callback-form'

describe('bounded payment callback forms', () => {
  it('parses a form within the real byte limit', async () => {
    const request = new Request('https://shop.test/callback', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: 'val_id=abc123&tran_id=MC-1234',
    })

    const form = await readCallbackForm(request, 64)
    expect(form.get('val_id')).toBe('abc123')
    expect(form.get('tran_id')).toBe('MC-1234')
  })

  it('rejects an oversized declared length before reading', async () => {
    const request = new Request('https://shop.test/callback', {
      method: 'POST',
      headers: {
        'content-length': '1000',
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: 'val_id=abc123',
    })

    await expect(readCallbackForm(request, 64)).rejects.toBeInstanceOf(CallbackPayloadTooLarge)
  })

  it('rejects an oversized real body when the length is missing', async () => {
    const request = new Request('https://shop.test/callback', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: `val_id=${'x'.repeat(100)}`,
    })

    await expect(readCallbackForm(request, 64)).rejects.toBeInstanceOf(CallbackPayloadTooLarge)
  })
})
