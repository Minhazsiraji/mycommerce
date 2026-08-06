/**
 * Public API of the accounts module. Other modules and the app import from here
 * and nowhere else — see the dependency rule in CLAUDE.md.
 *
 * Server-side only. Client components inside this module import
 * `./auth-client` directly; components outside it should not need auth calls.
 */

export { auth, type AuthSession } from './auth'
export { getSession, requireSession, requireRole, TWO_FACTOR_SETUP_PATH } from './guards'
export {
  AccountError,
  deleteAccount,
  exportAccountData,
  listMySessions,
  verifyPassword,
  type AccountExport,
} from './account-data'
export {
  archiveAddress,
  getAddress,
  listAddresses,
  saveAddress,
  setDefaultAddress,
} from './addresses'
export type { Role, User, Session } from './schema'
export {
  emailSchema,
  passwordSchema,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type RegisterInput,
  type LoginInput,
} from './validators'
