/**
 * The per-file clone-readiness rules, extracted so they can be tested against
 * deliberately-broken fixtures.
 *
 * A release gate that has only ever been observed passing is not a gate. These
 * rules previously lived inline in clone-readiness.mjs, where the only proof
 * they worked was that the current repository happened to pass — which it did
 * even while 36 SirajiBD literals sat in the legal pages.
 */

/**
 * Storage namespace kept deliberately: renaming a persisted key revokes the
 * consent and deduplication state of visitors who already have one. Migration
 * lives in the meta module; the literal here is invisible to customers.
 */
const NAMESPACE_PREFIX = /sirajibd[_:]/g

/** Known production analytics destinations must never be compiled in. */
const GOOGLE_TAG = /['"`](?:GT|G|AW)-[A-Z0-9-]{5,}['"`]/gi
const META_PIXEL = /['"`]\d{15,16}['"`]/g

/** Credentials that would settle money or send mail from the wrong account. */
const SECRET_SHAPES = [
  { pattern: /['"`]re_[A-Za-z0-9_]{20,}['"`]/g, label: 'Resend API key' },
  { pattern: /['"`]EAA[A-Za-z0-9]{40,}['"`]/g, label: 'Meta access token' },
  { pattern: /postgres(?:ql)?:\/\/[^\s'"`]+/gi, label: 'database connection string' },
  { pattern: /['"`]cloudinary:\/\/[^\s'"`]+['"`]/gi, label: 'Cloudinary credential URL' },
]

const BUSINESS_EMAIL = /[A-Za-z0-9._%+-]+@sirajibd\.com/gi

export function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
}

/**
 * @param relativePath repo-relative path, used only for messages
 * @param content      raw file source
 * @param options      `allowStoreDefaults` exempts the one file holding them
 * @returns array of failure strings; empty means the file is clean
 */
export function auditFile(relativePath, content, { allowStoreDefaults = false } = {}) {
  const failures = []

  if (content.includes('https://sirajibd.com') && !allowStoreDefaults) {
    failures.push(`Hard-coded SirajiBD production origin found in ${relativePath}`)
  }

  // Comments describe the original deployment's history and never reach a
  // customer; only shipped strings can.
  const shipped = stripComments(content)

  if (!allowStoreDefaults) {
    const identity = shipped.replace(NAMESPACE_PREFIX, '').match(/sirajibd/gi)
    if (identity) {
      failures.push(
        `Hard-coded store identity (${identity.length}x "SirajiBD") found in ${relativePath} — use STORE_CONFIG.name / STORE_HOST`,
      )
    }
  }

  if (BUSINESS_EMAIL.test(shipped)) {
    failures.push(`Hard-coded business email address found in ${relativePath}`)
  }
  BUSINESS_EMAIL.lastIndex = 0

  if (GOOGLE_TAG.test(content)) {
    failures.push(`Hard-coded Google tag ID found in ${relativePath}`)
  }
  GOOGLE_TAG.lastIndex = 0

  if (META_PIXEL.test(shipped)) {
    failures.push(`Possible hard-coded Meta Pixel/dataset ID found in ${relativePath}`)
  }
  META_PIXEL.lastIndex = 0

  for (const { pattern, label } of SECRET_SHAPES) {
    if (pattern.test(shipped)) failures.push(`Hard-coded ${label} found in ${relativePath}`)
    pattern.lastIndex = 0
  }

  return failures
}
