export const VTO_PUBLIC_KEY = 'vto_pk_dev_sirajibd_01'
export const VTO_BASE_URL = process.env.NEXT_PUBLIC_VTO_BASE_URL ?? 'https://agentsiraji-vto.vercel.app'

const PRODUCT_MAP: Record<string, string> = {
  '01a00e94-3559-7845-81b4-597c111386aa': 'de351aa8-97da-4303-8d12-4b3f3da1017d',
}

export function getVtoCatalogItemId(productId: string) {
  return PRODUCT_MAP[productId] ?? null
}
