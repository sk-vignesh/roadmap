/**
 * Email notifications via Resend
 * Set RESEND_API_KEY in .env.local
 */

const RESEND_API = 'https://api.resend.com/emails'

interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
}

export async function sendEmail(opts: SendEmailOptions): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY not set — skipping email')
    return false
  }

  const from = opts.from ?? process.env.RESEND_FROM_EMAIL ?? 'notifications@roadmap.app'

  try {
    const res = await fetch(RESEND_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(opts.to) ? opts.to : [opts.to],
        subject: opts.subject,
        html: opts.html,
      }),
    })
    return res.ok
  } catch (err) {
    console.error('[email] Failed to send:', err)
    return false
  }
}

export function newItemEmailHtml(opts: {
  title: string
  description: string | null
  authorName: string
  itemUrl: string
  appName?: string
}) {
  const appName = opts.appName ?? 'Roadmap'
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family:system-ui,sans-serif;background:#f4f4f5;margin:0;padding:32px">
  <div style="max-width:540px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
    <div style="background:#18181b;padding:20px 28px">
      <p style="color:#a1a1aa;margin:0;font-size:13px">${appName}</p>
    </div>
    <div style="padding:28px">
      <h2 style="margin:0 0 8px;font-size:18px;color:#18181b">New feature request</h2>
      <h3 style="margin:0 0 16px;font-size:15px;color:#3f3f46">${opts.title}</h3>
      ${opts.description ? `<p style="margin:0 0 20px;color:#52525b;font-size:14px;line-height:1.6">${opts.description.slice(0, 400)}${opts.description.length > 400 ? '...' : ''}</p>` : ''}
      <p style="margin:0 0 20px;font-size:13px;color:#71717a">Submitted by <strong>${opts.authorName}</strong></p>
      <a href="${opts.itemUrl}" style="display:inline-block;background:#18181b;color:#fff;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:500">View Item →</a>
    </div>
  </div>
</body>
</html>`
}

export function newCommentEmailHtml(opts: {
  itemTitle: string
  comment: string
  authorName: string
  itemUrl: string
  appName?: string
}) {
  const appName = opts.appName ?? 'Roadmap'
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family:system-ui,sans-serif;background:#f4f4f5;margin:0;padding:32px">
  <div style="max-width:540px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
    <div style="background:#18181b;padding:20px 28px">
      <p style="color:#a1a1aa;margin:0;font-size:13px">${appName}</p>
    </div>
    <div style="padding:28px">
      <h2 style="margin:0 0 8px;font-size:18px;color:#18181b">New comment on "${opts.itemTitle}"</h2>
      <blockquote style="margin:0 0 20px;padding:12px 16px;background:#f4f4f5;border-left:3px solid #18181b;border-radius:4px">
        <p style="margin:0;color:#3f3f46;font-size:14px;line-height:1.6">${opts.comment.slice(0, 300)}</p>
      </blockquote>
      <p style="margin:0 0 20px;font-size:13px;color:#71717a">By <strong>${opts.authorName}</strong></p>
      <a href="${opts.itemUrl}#comments" style="display:inline-block;background:#18181b;color:#fff;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:500">View Comment →</a>
    </div>
  </div>
</body>
</html>`
}
