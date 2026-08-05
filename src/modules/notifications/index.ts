/**
 * Public API of the notifications module.
 */

export { sendMail, sendVerificationEmail, sendPasswordResetEmail } from './mailer'
export { sendOrderCancelled, sendOrderConfirmed, sendOrderShipped } from './order-emails'
