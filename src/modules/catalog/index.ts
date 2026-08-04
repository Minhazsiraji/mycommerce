/**
 * Public API of the catalog module. Everything outside imports from here.
 *
 * Server-side only — it re-exports the repository, which touches Drizzle.
 * Client components import `./validators` directly, which has no server deps.
 */

export {
  createCategory,
  createImageUploadSignature,
  createProduct,
  attachImage,
  deleteCategory,
  removeImage,
  reorderImages,
  setProductStatus,
  updateCategory,
  updateProduct,
} from './actions'

export {
  getCategoryBySlug,
  getProductById,
  getProductBySlug,
  listActiveProducts,
  listActiveProductSlugs,
  listCategories,
  listProductsForAdmin,
  PAGE_SIZE,
} from './repository'

export type { Category, Product, ProductImage, ProductStatus, ProductVariant } from './schema'

export {
  categoryInputSchema,
  productFiltersSchema,
  productInputSchema,
  slugify,
  variantInputSchema,
  type CategoryInput,
  type ProductFilters,
  type ProductInput,
  type VariantInput,
} from './validators'
