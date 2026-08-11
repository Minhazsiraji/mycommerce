/** Shared by Pixel and CAPI. Stable Purchase ids make refreshes harmless. */
export function purchaseEventId(orderId: string) {
  return `purchase:${orderId}`
}
