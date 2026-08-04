import { describe, expect, it, vi } from 'vitest'

import { isRetryableDbError, withDbRetry } from './retry'

/** Mimics how Drizzle wraps a driver error. */
const wrapped = (cause: unknown) => Object.assign(new Error('Failed query'), { cause })

describe('isRetryableDbError', () => {
  it('retries connection-level failures, which carry no SQLSTATE', () => {
    expect(isRetryableDbError(new Error('Connection terminated unexpectedly'))).toBe(true)
    expect(isRetryableDbError(wrapped({ type: 'error' }))).toBe(true)
  })

  it('does NOT retry errors Postgres answered with a code', () => {
    // 23505 is unique_violation — a duplicate SKU is still duplicate next time,
    // so retrying only delays a message the user needs immediately.
    expect(isRetryableDbError(wrapped({ code: '23505' }))).toBe(false)
    expect(isRetryableDbError(wrapped({ code: '23503' }))).toBe(false)
    expect(isRetryableDbError({ code: '42P01' })).toBe(false)
  })

  it('finds the code through a nested cause chain', () => {
    expect(isRetryableDbError(wrapped(wrapped({ code: '23505' })))).toBe(false)
  })

  it('ignores non-SQLSTATE codes such as Node error strings', () => {
    // ECONNRESET is a connection failure, not a Postgres response.
    expect(isRetryableDbError(wrapped({ code: 'ECONNRESET' }))).toBe(true)
  })
})

describe('withDbRetry', () => {
  it('returns the value without retrying when the first attempt works', async () => {
    const operation = vi.fn().mockResolvedValue('ok')
    await expect(withDbRetry(operation)).resolves.toBe('ok')
    expect(operation).toHaveBeenCalledTimes(1)
  })

  it('recovers from a transient failure', async () => {
    const operation = vi
      .fn()
      .mockRejectedValueOnce(new Error('Connection terminated'))
      .mockResolvedValue('recovered')

    await expect(withDbRetry(operation)).resolves.toBe('recovered')
    expect(operation).toHaveBeenCalledTimes(2)
  })

  it('gives up after exhausting attempts and rethrows the last error', async () => {
    const operation = vi.fn().mockRejectedValue(new Error('Connection terminated'))
    await expect(withDbRetry(operation)).rejects.toThrow('Connection terminated')
    expect(operation).toHaveBeenCalledTimes(3)
  })

  it('fails fast on a Postgres error rather than retrying', async () => {
    const operation = vi.fn().mockRejectedValue(wrapped({ code: '23505' }))
    await expect(withDbRetry(operation)).rejects.toThrow()
    expect(operation).toHaveBeenCalledTimes(1)
  })
})
