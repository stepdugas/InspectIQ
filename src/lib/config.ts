// Canonical app URL — used for emails, share links, redirects, and OAuth callbacks.
// In production, set NEXT_PUBLIC_APP_URL in Vercel. Locally, defaults to localhost.
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.NODE_ENV === 'production'
    ? 'https://useinspectiq.com'
    : 'http://localhost:3000')
