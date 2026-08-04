import { cloudinaryStorage } from './cloudinary'
import type { StorageProvider } from './types'

/**
 * The single configured storage provider. Import `storage` — never the
 * Cloudinary adapter directly — so swapping providers is this one line.
 */
export const storage: StorageProvider = cloudinaryStorage

export type { ImageTransform, StorageProvider, UploadedAsset, UploadSignature } from './types'

/** Folder layout inside the provider. Keeps product media namespaced. */
export const STORAGE_FOLDERS = {
  products: 'mycommerce/products',
  categories: 'mycommerce/categories',
} as const
