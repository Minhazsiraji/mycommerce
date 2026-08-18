import { describe, expect, it } from 'vitest'

import {
  buildMetaConnectionTestPayload,
  formatMetaConnectionError,
  metaConnectionTestConfigError,
  sanitizeMetaError,
} from './connection-test'

describe('Meta CAPI connection test', () => {
  it('builds an isolated Test Events payload for a successful connection check', () => {
    const payload = buildMetaConnectionTestPayload({
      testEventCode: 'TEST12345',
      eventSourceUrl: 'https://preview.example/__meta-connection-test',
      eventTime: 1_787_000_000,
      eventId: 'meta-connection-test:fixed',
      syntheticExternalIdHash: 'a'.repeat(64),
    })

    expect(payload).toEqual({
      data: [
        {
          event_name: 'PageView',
          event_time: 1_787_000_000,
          event_id: 'meta-connection-test:fixed',
          action_source: 'website',
          event_source_url: 'https://preview.example/__meta-connection-test',
          user_data: { external_id: ['a'.repeat(64)] },
        },
      ],
      test_event_code: 'TEST12345',
    })
  })

  it('requires a Test Event Code so the connection test cannot create normal analytics traffic', () => {
    expect(
      metaConnectionTestConfigError({
        enabled: true,
        datasetId: '929594423528382',
        accessToken: 'server-only-token',
      }),
    ).toMatch(/Test Event Code/)

    expect(
      metaConnectionTestConfigError({
        enabled: true,
        datasetId: '929594423528382',
        accessToken: 'server-only-token',
        testEventCode: 'TEST12345',
      }),
    ).toBeNull()
  })

  it('sanitizes Meta HTTP errors without exposing the access token', () => {
    const token = 'EAAB-super-secret-token-value'
    const metaError = sanitizeMetaError(
      {
        error: {
          message: `Invalid OAuth access token: ${token}`,
          type: 'OAuthException',
          code: 190,
          error_subcode: 463,
        },
      },
      token,
    )
    const formatted = formatMetaConnectionError({ httpStatus: 400, metaError })

    expect(formatted).toContain('HTTP 400')
    expect(formatted).toContain('code 190')
    expect(formatted).toContain('subcode 463')
    expect(formatted).toContain('OAuthException')
    expect(formatted).toContain('[redacted]')
    expect(formatted).not.toContain(token)
  })

  it('handles malformed or non-JSON Meta errors without leaking response content', () => {
    const metaError = sanitizeMetaError('<html>gateway error</html>', 'secret-token')
    expect(metaError).toEqual({
      message: undefined,
      type: undefined,
      code: undefined,
      subcode: undefined,
    })
    expect(formatMetaConnectionError({ httpStatus: 502, metaError })).toBe(
      'Meta rejected the test event (HTTP 502).',
    )
  })
})
