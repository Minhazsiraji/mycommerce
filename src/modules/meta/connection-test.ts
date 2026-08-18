type MetaErrorShape = {
  error?: {
    message?: unknown
    type?: unknown
    code?: unknown
    error_subcode?: unknown
  }
}

export type MetaConnectionTestPayload = {
  data: Array<{
    event_name: 'PageView'
    event_time: number
    event_id: string
    action_source: 'website'
    event_source_url: string
    user_data: {
      external_id: string[]
    }
  }>
  test_event_code: string
}

export function metaConnectionTestConfigError(input: {
  enabled: boolean
  datasetId?: string
  accessToken?: string
  testEventCode?: string
}) {
  if (!input.enabled) return 'Meta tracking is disabled.'
  if (!input.datasetId || !input.accessToken) {
    return 'A Dataset ID and CAPI access token are required for a server connection test.'
  }
  if (!input.testEventCode) {
    return 'Add a Meta Test Event Code before testing the server connection. This prevents the connection check from creating normal production analytics traffic.'
  }
  return null
}

export function buildMetaConnectionTestPayload(input: {
  testEventCode: string
  eventSourceUrl: string
  eventTime?: number
  eventId?: string
  syntheticExternalIdHash: string
}): MetaConnectionTestPayload {
  const eventTime = input.eventTime ?? Math.floor(Date.now() / 1000)
  const eventId = input.eventId ?? `meta-connection-test:${eventTime}`

  return {
    data: [
      {
        event_name: 'PageView',
        event_time: eventTime,
        event_id: eventId,
        action_source: 'website',
        event_source_url: input.eventSourceUrl,
        user_data: {
          external_id: [input.syntheticExternalIdHash],
        },
      },
    ],
    test_event_code: input.testEventCode,
  }
}

function safeString(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : undefined
}

function safeNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

export function sanitizeMetaError(input: unknown, accessToken: string) {
  const body = input && typeof input === 'object' ? (input as MetaErrorShape) : {}
  const error = body.error && typeof body.error === 'object' ? body.error : undefined

  let message = safeString(error?.message, 220)
  if (message) {
    if (accessToken) message = message.split(accessToken).join('[redacted]')
    message = message
      .replace(/([?&]access_token=)[^&\s]+/gi, '$1[redacted]')
      .replace(/(access[_ -]?token\s*(?:=|:)\s*)[^\s,;]+/gi, '$1[redacted]')
  }

  return {
    message,
    type: safeString(error?.type, 80),
    code: safeNumber(error?.code),
    subcode: safeNumber(error?.error_subcode),
  }
}

export function formatMetaConnectionError(input: {
  httpStatus: number
  metaError: ReturnType<typeof sanitizeMetaError>
}) {
  const details: string[] = []
  if (input.metaError.code !== undefined) details.push(`code ${input.metaError.code}`)
  if (input.metaError.subcode !== undefined) details.push(`subcode ${input.metaError.subcode}`)
  if (input.metaError.type) details.push(input.metaError.type)

  const suffix = details.length ? ` (${details.join(', ')})` : ''
  const message = input.metaError.message ? ` ${input.metaError.message}` : ''
  return `Meta rejected the test event (HTTP ${input.httpStatus})${suffix}.${message}`.slice(0, 300)
}
