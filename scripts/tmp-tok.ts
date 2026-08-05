import { db } from '@/lib/db'
import { carts } from '@/modules/cart/schema'
import { desc } from 'drizzle-orm'
const [c] = await db.select().from(carts).orderBy(desc(carts.createdAt)).limit(1)
console.log(c!.sessionToken)
