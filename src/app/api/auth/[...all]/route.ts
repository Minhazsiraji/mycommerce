import { toNextJsHandler } from 'better-auth/next-js'

import { auth } from '@/modules/accounts'

export const { GET, POST } = toNextJsHandler(auth)
