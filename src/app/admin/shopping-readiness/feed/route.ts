import { requireRole } from '@/modules/accounts'
import { buildDiscoveryCsv } from '@/modules/catalog'

export async function GET() {
  await requireRole('admin')
  const body = await buildDiscoveryCsv()
  return new Response(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="sirajibd-ai-product-discovery.csv"',
      'Cache-Control': 'no-store',
    },
  })
}
