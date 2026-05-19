export function GET() {
  return new Response('google-site-verification: google0730c6dc84ba60d3.html', {
    headers: { 'Content-Type': 'text/html' },
  })
}
