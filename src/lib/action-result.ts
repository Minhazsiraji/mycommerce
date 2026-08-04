import { z } from 'zod'

/**
 * Uniform Server Action return shape, per docs/03-api.md.
 *
 * Actions *return* errors; they do not throw them. A thrown error means a
 * genuine fault — it becomes a 500 and a logged incident. An invalid coupon
 * code or a duplicate slug is not a fault, and treating it as one produces
 * error pages where a form message belongs.
 */

export type ErrorCode =
  | 'validation'
  | 'not_found'
  | 'conflict'
  | 'forbidden'
  | 'unavailable'
  | 'unexpected'

export type ActionError = {
  code: ErrorCode
  /** Safe to display. Internal detail goes to the logger, never here. */
  message: string
  /** Field name -> message, for form-level display. */
  fields?: Record<string, string>
}

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: ActionError }

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data }
}

export function fail<T = never>(
  code: ErrorCode,
  message: string,
  fields?: Record<string, string>,
): ActionResult<T> {
  return { ok: false, error: fields ? { code, message, fields } : { code, message } }
}

/** Flattens Zod issues into the first message per field. */
export function fromZodError<T = never>(error: z.ZodError): ActionResult<T> {
  const fields: Record<string, string> = {}

  for (const issue of error.issues) {
    const key = issue.path.join('.')
    if (key && !(key in fields)) fields[key] = issue.message
  }

  return fail('validation', 'Please correct the highlighted fields.', fields)
}
