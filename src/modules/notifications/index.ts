/**
 * Public API of the notifications module.
 */

export { sendMail, sendVerificationEmail, sendPasswordResetEmail } from './mailer'
export {
  sendOrderCancelled,
  sendOrderConfirmed,
  sendOrderPlacedCod,
  sendOrderDelivered,
  sendOrderShipped,
} from './order-emails'
