import 'server-only'

import { v2 as cloudinary } from 'cloudinary'

import { env } from '@/lib/env'

import type { ImageTransform, StorageProvider, UploadedAsset, UploadSignature } from './types'

/**
 * Cloudinary implementation of StorageProvider. Nothing outside this file may
 * import the `cloudinary` package — see the rationale in `types.ts`.
 */

function requireConfig() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = env

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error(
      'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.',
    )
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  })

  return { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET }
}

function toCloudinaryTransform(t: ImageTransform) {
  return {
    width: t.width,
    height: t.height,
    // 'fill' crops to fill the box, 'fit' letterboxes inside it.
    crop: t.fit === 'contain' ? 'fit' : t.width || t.height ? 'fill' : undefined,
    // Default both to 'auto': Cloudinary then picks per-image quality and
    // negotiates AVIF/WebP from the Accept header. This is the whole reason
    // the performance budget in docs/05 is reachable without a build pipeline.
    quality: t.quality ?? 'auto',
    fetch_format: t.format ?? 'auto',
  }
}

export const cloudinaryStorage: StorageProvider = {
  id: 'cloudinary',

  async upload({ data, folder, filename }): Promise<UploadedAsset> {
    requireConfig()

    const result = await new Promise<Record<string, unknown>>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          public_id: filename,
          // Never trust a client-supplied name to be unique.
          use_filename: false,
          unique_filename: true,
          overwrite: false,
        },
        (error, result) => {
          if (error) reject(new Error(error.message))
          else if (!result) reject(new Error('Cloudinary returned no result'))
          else resolve(result as unknown as Record<string, unknown>)
        },
      )
      stream.end(data)
    })

    return {
      key: String(result.public_id),
      width: Number(result.width),
      height: Number(result.height),
      format: String(result.format),
      bytes: Number(result.bytes),
    }
  },

  createUploadSignature({ folder }): UploadSignature {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = requireConfig()

    const timestamp = Math.round(Date.now() / 1000)
    const allowedFormats = 'jpg,png,webp,avif'

    // Only these params are signed, so only these can be used. A client that
    // tries to add its own folder or overwrite flag invalidates the signature.
    const signature = cloudinary.utils.api_sign_request(
      { allowed_formats: allowedFormats, folder, timestamp },
      CLOUDINARY_API_SECRET,
    )

    return {
      uploadUrl: `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      fields: {
        api_key: CLOUDINARY_API_KEY,
        timestamp: String(timestamp),
        signature,
        folder,
        allowed_formats: allowedFormats,
      },
      expiresIn: 3600,
    }
  },

  async inspect(key: string): Promise<UploadedAsset> {
    requireConfig()
    const result = (await cloudinary.api.resource(key, {
      resource_type: 'image',
      type: 'upload',
    })) as Record<string, unknown>

    return {
      key: String(result.public_id),
      width: Number(result.width),
      height: Number(result.height),
      format: String(result.format).toLowerCase(),
      bytes: Number(result.bytes),
    }
  },

  async delete(key: string): Promise<void> {
    requireConfig()
    const result = await cloudinary.uploader.destroy(key, { resource_type: 'image' })

    // 'not found' is fine — deleting an already-deleted asset should be a no-op
    // so retries and cleanup jobs stay safe to re-run.
    if (result.result !== 'ok' && result.result !== 'not found') {
      throw new Error(`Cloudinary delete failed: ${result.result}`)
    }
  },

  url(key: string, transform: ImageTransform = {}): string {
    requireConfig()
    return cloudinary.url(key, { secure: true, ...toCloudinaryTransform(transform) })
  },
}
