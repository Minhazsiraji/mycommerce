/**
 * Provider-agnostic image storage.
 *
 * Cloudinary is today's implementation because Cloudflare's R2 signup could not
 * take payment. R2 remains the preferred destination — zero egress fees matter
 * when serving product photos — so nothing above this interface may reference a
 * specific vendor. Switching means writing one new file and copying the objects
 * across.
 *
 * `key` is whatever stably identifies the object to its provider: a Cloudinary
 * `public_id`, an R2 object key. It is what lands in `product_images.r2_key`,
 * and it must survive a provider swap only in the sense that the *column* does —
 * the values themselves get rewritten during a migration.
 */

export type UploadedAsset = {
  key: string
  width: number
  height: number
  /** Delivered format, e.g. 'jpg'. Not what the browser receives — see `url()`. */
  format: string
  bytes: number
}

export type ImageTransform = {
  width?: number
  height?: number
  /** 'cover' crops to fill the box; 'contain' fits inside it. */
  fit?: 'cover' | 'contain'
  /** 'auto' lets the provider pick per-image. Prefer it over a fixed number. */
  quality?: number | 'auto'
  /** 'auto' negotiates AVIF/WebP from the request headers. */
  format?: 'auto' | 'webp' | 'avif' | 'jpg'
}

/**
 * Fields the browser posts directly to the provider. Signing server-side keeps
 * the API secret out of the client while letting large files skip our server
 * entirely — a Vercel function has a request body limit that product photos
 * would otherwise hit.
 */
export type UploadSignature = {
  uploadUrl: string
  fields: Record<string, string>
  /** Seconds until `fields` stop being accepted. */
  expiresIn: number
}

export interface StorageProvider {
  readonly id: string

  /** Server-side upload. Use for seeds and admin actions that already hold bytes. */
  upload(input: { data: Buffer; folder: string; filename?: string }): Promise<UploadedAsset>

  /** Credentials for a direct browser upload. */
  createUploadSignature(input: { folder: string }): UploadSignature

  /** Authenticated metadata lookup used before trusting a direct upload key. */
  inspect(key: string): Promise<UploadedAsset>

  delete(key: string): Promise<void>

  /**
   * Public delivery URL. Synchronous — it is string construction, not a request,
   * so it is safe to call while rendering.
   *
   * Transform support is provider-dependent: Cloudinary does this natively, and
   * a future R2 adapter would need Cloudflare Images or a resizing Worker behind
   * it. Any replacement must honour these options rather than ignore them.
   */
  url(key: string, transform?: ImageTransform): string
}
