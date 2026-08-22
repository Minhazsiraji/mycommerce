import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * The mail path a clone depends on.
 *
 * An isolated preview inherited a mail API key but not EMAIL_FROM, fell back to
 * the schema default `noreply@example.com`, and the provider refused every
 * message because that domain was not verified on the account. Nothing failed
 * loudly: users were created, no mail arrived, and sign-in was impossible.
 */
const state = vi.hoisted(() => ({
  apiKey: undefined as string | undefined,
  from: 'Example Store <noreply@example.com>',
  nodeEnv: 'test' as string,
  response: { ok: true, status: 200 },
  lastRequest: null as { url: string; body: Record<string, unknown> } | null,
}))

vi.mock('server-only', () => ({}))
vi.mock('@/lib/env', () => ({
  get env() {
    return {
      RESEND_API_KEY: state.apiKey,
      EMAIL_FROM: state.from,
      NODE_ENV: state.nodeEnv,
    }
  },
}))

const { sendMail, sendVerificationEmail } = await import('./mailer')

beforeEach(() => {
  state.apiKey = 'test-key'
  state.from = 'Example Store <noreply@example.com>'
  state.nodeEnv = 'test'
  state.response = { ok: true, status: 200 }
  state.lastRequest = null

  vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
    state.lastRequest = { url, body: JSON.parse(String(init.body)) }
    return { ok: state.response.ok, status: state.response.status, text: async () => 'body' }
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('the sender is deployment configuration, not source identity', () => {
  it('sends from whatever EMAIL_FROM says', async () => {
    state.from = 'Client Store <hello@client.example>'
    await sendMail({ to: 'a@example.com', subject: 'Hi', html: '<p>Hi</p>' })

    expect(state.lastRequest?.body.from).toBe('Client Store <hello@client.example>')
  })

  it('hardcodes no store identity in a verification email', async () => {
    await sendVerificationEmail('a@example.com', 'https://client.example/verify?token=x')

    const body = JSON.stringify(state.lastRequest?.body)
    expect(body).not.toMatch(/sirajibd/i)
    expect(body).not.toMatch(/SirajiBD/)
  })
})

describe('when the provider refuses', () => {
  it('raises an error rather than reporting success', async () => {
    // The failure mode that stranded the first clone user.
    state.response = { ok: false, status: 403 }

    await expect(
      sendMail({ to: 'a@example.com', subject: 'Hi', html: '<p>Hi</p>' }),
    ).rejects.toThrow(/403/)
  })

  it('puts neither the recipient nor the response body in the error', async () => {
    state.response = { ok: false, status: 422 }

    await expect(
      sendMail({ to: 'customer@example.com', subject: 'Hi', html: '<p>Hi</p>' }),
    ).rejects.toThrow(
      expect.objectContaining({ message: expect.not.stringContaining('customer@example.com') }),
    )
  })
})

describe('without a mail account configured', () => {
  it('logs instead of sending in development and tests only', async () => {
    state.apiKey = undefined
    const info = vi.spyOn(console, 'info').mockImplementation(() => {})

    await sendMail({ to: 'a@example.com', subject: 'Hi', html: '<p>Hi</p>' })

    expect(info).toHaveBeenCalled()
    expect(state.lastRequest).toBeNull()
    info.mockRestore()
  })

  it('refuses in production rather than pretending mail was sent', async () => {
    state.apiKey = undefined
    state.nodeEnv = 'production'

    await expect(
      sendMail({ to: 'a@example.com', subject: 'Hi', html: '<p>Hi</p>' }),
    ).rejects.toThrow(/RESEND_API_KEY/)
  })

  it('does not become a way to read verification links out of a preview', async () => {
    // A Vercel preview runs in production mode, so dropping the key throws
    // there too. Recorded as a test because it was briefly recommended as an
    // acceptance workaround, and it would not have worked.
    state.apiKey = undefined
    state.nodeEnv = 'production'
    const info = vi.spyOn(console, 'info').mockImplementation(() => {})

    await expect(
      sendVerificationEmail('a@example.com', 'https://client.example/verify?token=secret'),
    ).rejects.toThrow()
    expect(info).not.toHaveBeenCalled()

    info.mockRestore()
  })
})

describe('the verification email itself', () => {
  it('carries the link it was given', async () => {
    const url = 'https://client.example/api/auth/verify-email?token=abc'
    await sendVerificationEmail('a@example.com', url)

    expect(String(state.lastRequest?.body.html)).toContain(url)
  })

  it('goes only to the address it was given', async () => {
    await sendVerificationEmail('one@example.com', 'https://client.example/v')
    expect(state.lastRequest?.body.to).toBe('one@example.com')
  })
})
