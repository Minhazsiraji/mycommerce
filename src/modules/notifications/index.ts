/**
 * Public API of the notifications module.
 */

export { sendMail, sendVerificationEmail, sendPasswordResetEmail } from './mailer'
export {
  sendOrderCancelled,
  sendOrderConfirmed,
  sendOrderDelivered,
  sendOrderShipped,
} from './order-emails'
