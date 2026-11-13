/** Rules exclusive to the MoyMoy Messenger-to-COD denim journey.
 * Monetary values are integer poisha. Other shop checkouts are untouched.
 */
export const QUICK_DENIM_UNIT_PRICE = 75_000
export const QUICK_DENIM_MAX_ITEMS = 10

export function isQuickDenimProduct(title: string): boolean {
  return /(?:denim|jeans|baggy)/i.test(title) && /(?:men'?s?|gents|male|semi[ -]?baggy)/i.test(title)
}

export function isDhakaCity(district: string, city: string): boolean {
  return district.trim().toLowerCase() === 'dhaka' &&
    city.trim().toLowerCase() === 'dhaka city'
}

export function quickDenimShipping(itemCount: number, district: string, city: string) {
  if (!Number.isInteger(itemCount) || itemCount < 1 || itemCount > QUICK_DENIM_MAX_ITEMS) {
    throw new Error('Invalid denim quantity')
  }
  const inside = isDhakaCity(district, city)
  return {
    cost: itemCount >= 2 ? 0 : inside ? 8_000 : 12_000,
    name: inside ? 'Inside Dhaka' : 'Outside Dhaka',
  }
}

export function taka(minor: number) {
  return '৳' + (minor / 100).toLocaleString('en-BD', { maximumFractionDigits: 2 })
}
