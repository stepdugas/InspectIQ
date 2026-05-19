// Gmail API helper — read inbox messages and send replies via the inspector's Gmail account
import { getGoogleTokens } from '@/lib/google-auth'

const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1/users/me'

interface GmailHeader {
  name: string
  value: string
}

interface GmailMessagePart {
  mimeType: string
  body: { data?: string; size: number }
  parts?: GmailMessagePart[]
}

export interface GmailMessage {
  id: string
  threadId: string
  from: string
  to: string
  subject: string
  date: string
  snippet: string
  body: string // decoded plain text or HTML body
}

// Decode base64url-encoded Gmail body
function decodeBase64Url(data: string): string {
  // Gmail uses base64url encoding (- instead of +, _ instead of /)
  const base64 = data.replace(/-/g, '+').replace(/_/g, '/')
  return Buffer.from(base64, 'base64').toString('utf-8')
}

// Extract the plain text body from a Gmail message payload
function extractBody(payload: GmailMessagePart): string {
  // Simple message with body directly on payload
  if (payload.body?.data) {
    return decodeBase64Url(payload.body.data)
  }
  // Multipart — look for text/plain first, then text/html
  if (payload.parts) {
    const textPart = payload.parts.find(p => p.mimeType === 'text/plain')
    if (textPart?.body?.data) return decodeBase64Url(textPart.body.data)
    const htmlPart = payload.parts.find(p => p.mimeType === 'text/html')
    if (htmlPart?.body?.data) return decodeBase64Url(htmlPart.body.data)
    // Nested multipart (e.g., multipart/alternative inside multipart/mixed)
    for (const part of payload.parts) {
      if (part.parts) {
        const nested = extractBody(part)
        if (nested) return nested
      }
    }
  }
  return ''
}

// Get a header value by name (case-insensitive)
function getHeader(headers: GmailHeader[], name: string): string {
  return headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value ?? ''
}

// Fetch recent inbox messages for a user via Gmail API
export async function getRecentEmails(
  userId: string,
  maxResults: number = 10,
  after?: Date,
): Promise<GmailMessage[]> {
  const tokens = await getGoogleTokens(userId)
  if (!tokens) {
    console.error(`[InspectIQ] Gmail: no valid tokens for user ${userId}`)
    return []
  }

  // Build query — unread inbox messages, optionally after a date
  let q = 'in:inbox is:unread'
  if (after) {
    const epoch = Math.floor(after.getTime() / 1000)
    q += ` after:${epoch}`
  }

  const params = new URLSearchParams({ q, maxResults: String(maxResults) })
  const listRes = await fetch(`${GMAIL_API}/messages?${params}`, {
    headers: { Authorization: `Bearer ${tokens.accessToken}` },
    signal: AbortSignal.timeout(15000),
  })

  if (!listRes.ok) {
    console.error(`[InspectIQ] Gmail list failed for user ${userId}:`, await listRes.text())
    return []
  }

  const listData = await listRes.json()
  const messageIds: { id: string }[] = listData.messages ?? []
  if (messageIds.length === 0) return []

  // Fetch each message's full content
  const messages: GmailMessage[] = []
  for (const { id } of messageIds) {
    try {
      const msgRes = await fetch(`${GMAIL_API}/messages/${id}?format=full`, {
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
        signal: AbortSignal.timeout(10000),
      })
      if (!msgRes.ok) continue

      const msg = await msgRes.json()
      const headers: GmailHeader[] = msg.payload?.headers ?? []

      messages.push({
        id: msg.id,
        threadId: msg.threadId,
        from: getHeader(headers, 'From'),
        to: getHeader(headers, 'To'),
        subject: getHeader(headers, 'Subject'),
        date: getHeader(headers, 'Date'),
        snippet: msg.snippet ?? '',
        body: extractBody(msg.payload),
      })
    } catch (err) {
      console.error(`[InspectIQ] Gmail: failed to fetch message ${id}:`, err)
    }
  }

  return messages
}

// Send a reply via Gmail API so it appears in the same thread
export async function sendGmailReply(
  userId: string,
  to: string,
  subject: string,
  htmlBody: string,
  threadId: string,
): Promise<boolean> {
  const tokens = await getGoogleTokens(userId)
  if (!tokens) {
    console.error(`[InspectIQ] Gmail: no valid tokens for user ${userId}`)
    return false
  }

  const fromEmail = tokens.email ?? 'me'

  // Build RFC 2822 message
  const messageParts = [
    `From: ${fromEmail}`,
    `To: ${to}`,
    `Subject: Re: ${subject.replace(/^Re:\s*/i, '')}`,
    `In-Reply-To: <${threadId}@mail.gmail.com>`,
    `References: <${threadId}@mail.gmail.com>`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    '',
    htmlBody,
  ].join('\r\n')

  // Gmail API expects base64url encoding
  const encoded = Buffer.from(messageParts)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  const sendRes = await fetch(`${GMAIL_API}/messages/send`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: encoded, threadId }),
    signal: AbortSignal.timeout(15000),
  })

  if (!sendRes.ok) {
    console.error(`[InspectIQ] Gmail send failed for user ${userId}:`, await sendRes.text())
    return false
  }

  console.log(`[InspectIQ] Gmail reply sent to ${to} in thread ${threadId}`)
  return true
}
