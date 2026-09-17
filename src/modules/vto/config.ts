export const VTO_PUBLIC_KEY = process.env.NEXT_PUBLIC_VTO_PUBLIC_KEY ?? 'vto_pk_dev_sirajibd_01'
export const VTO_BASE_URL = process.env.NEXT_PUBLIC_VTO_BASE_URL ?? 'https://agentsiraji-vto.vercel.app'
export const VTO_SDK_URL = `${VTO_BASE_URL}/sdk/v1/agentsiraji-vto.js`

const VTO_ENABLED_PRODUCTS = new Set([
  '01a00e94-3559-7845-81b4-597c111386aa',
])

export function isVtoEnabledProduct(productId: string) {
  return VTO_ENABLED_PRODUCTS.has(productId)
}
