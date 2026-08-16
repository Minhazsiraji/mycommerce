export class CallbackPayloadTooLarge extends Error {}

/**
 * Reads a provider form without trusting Content-Length.
 *
 * A missing or dishonest header must not turn `request.formData()` into an
 * unbounded allocation. The stream is stopped as soon as the real body crosses
 * the limit, then rebuilt with its original content type so multipart boundary
 * handling remains standards-compliant.
 */
export async function readCallbackForm(request: Request, maxBytes: number): Promise<FormData> {
  const declared = request.headers.get('content-length')
  if (declared) {
    const parsed = Number(declared)
    if (Number.isFinite(parsed) && parsed > maxBytes) throw new CallbackPayloadTooLarge()
  }

  if (!request.body) return new FormData()

  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      total += value.byteLength
      if (total > maxBytes) {
        await reader.cancel()
        throw new CallbackPayloadTooLarge()
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }

  const body = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    body.set(chunk, offset)
    offset += chunk.byteLength
  }

  const contentType = request.headers.get('content-type')
  const headers = contentType ? { 'content-type': contentType } : undefined
  return new Response(body, { headers }).formData()
}
