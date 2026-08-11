/** Conversion happens only at the analytics provider boundary. */
export function minorToMetaValue(amount: number) {
  return Number((amount / 100).toFixed(2))
}
