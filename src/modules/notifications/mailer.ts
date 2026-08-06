import 'server-only'

import { escapeHtml } from '@/lib/escape-html'
import { env } from '@/lib/env'

/**
 * Resend over plain fetch — the REST surface we need is two fields wide, and a
 * dependency that wraps one POST is not worth the supply-chain surface.
 *
 * Without RESEND_API_KEY the message is logged instead of sent, so local
 * development and preview deploys work without a mail account. Production
 * refuses to start without one (see the check below).
 */

type Mail = {
  to: string
  subject: string
  html: string
}

export { escapeHtml }

export async function sendMail({ to, subject, html }: Mail): Promise<void> {
  if (!env.RESEND_API_KEY) {
    if (env.NODE_ENV === 'production') {
      throw new Error('RESEND_API_KEY is required in production')
    }
    console.info(`[mail] to=${to} subject=${JSON.stringify(subject)}\n${html}`)
    return
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: env.EMAIL_FROM, to, subject, html }),
  })

  if (!res.ok) {
    // Body may contain the recipient address; log status only.
    throw new Error(`Resend rejected the message: ${res.status}`)
  }
}

function layout(heading: string, body: string, action?: { label: string; url: string }) {
  // Both call sites pass fixed copy, but escaping unconditionally means that
  // stays true even if someone later threads a user value through here.
  const url = action ? escapeHtml(action.url) : ''

  return `
    <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#111">
      <h1 style="font-size:20px;margin:0 0 16px">${escapeHtml(heading)}</h1>
      <p style="font-size:15px;line-height:1.6;margin:0 0 24px;color:#444">${escapeHtml(body)}</p>
      ${
        action
          ? `<a href="${url}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 20px;border-radius:6px;font-size:15px">${escapeHtml(action.label)}</a>
             <p style="font-size:13px;color:#777;margin:24px 0 0;line-height:1.6">If the button does not work, paste this into your browser:<br><span style="word-break:break-all">${url}</span></p>`
          : ''
      }
    </div>
  `
}

export function sendVerificationEmail(to: string, url: string) {
  return sendMail({
    to,
    subject: 'Verify your email',
    html: layout(
      'Confirm your email address',
      'Verify this address to finish setting up your account. The link expires in one hour.',
      { label: 'Verify email', url },
    ),
  })
}

export function sendPasswordResetEmail(to: string, url: string) {
  return sendMail({
    to,
    subject: 'Reset your password',
    html: layout(
      'Reset your password',
      'Use the link below to choose a new password. It expires in 30 minutes and can only be used once. If you did not request this, no action is needed.',
      { label: 'Reset password', url },
    ),
  })
}
