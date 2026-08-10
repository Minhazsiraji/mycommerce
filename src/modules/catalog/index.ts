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

/**
 * Uncached reads. Admin screens use these — an operator editing a product must
 * see the database, not a cached copy.
 */
export {
  getCategoryBySlug,
  getProductById,
  getProductBySlug,
  listActiveProducts,
  listActiveProductSlugs,
  listCategories,
  listIndexableCategories,
  listProductsForAdmin,
  PAGE_SIZE,
} from './repository'

/** Cached reads for the storefront. Invalidated by tag from the actions. */
export {
  getCachedActiveProducts,
  getCachedCategories,
  getCachedCategoryBySlug,
  getCachedCategoryFacetData,
  getCachedProductBySlug,
  getCachedRelatedProducts,
} from './cached'

export { CATALOG_TAGS } from './tags'
export { categoryHref, categoryQuery, hasCategoryFilters } from './category-url'

export type { Category, Product, ProductImage, ProductStatus, ProductVariant } from './schema'

export {
  categoryInputSchema,
  categoryFiltersSchema,
  productFiltersSchema,
  productInputSchema,
  slugify,
  variantInputSchema,
  type CategoryInput,
  type CategoryFilters,
  type ProductFilters,
  type ProductInput,
  type VariantInput,
} from './validators'
