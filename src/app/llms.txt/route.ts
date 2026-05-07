export function GET() {
  const body = `# InspectIQ
> Home inspection software that writes reports using AI

## What is InspectIQ?
InspectIQ is a SaaS tool for licensed home inspectors. It generates professional inspection report narratives using AI (Claude), with photo annotation, client payment collection, scheduling, custom templates, and branded PDF reports. InterNACHI standards pre-loaded.

## Pricing
$99/month or $79/month annually. 14-day free trial, no credit card required.

## Links
- Homepage: https://www.useinspectiq.com
- Blog: https://www.useinspectiq.com/blog
- Sample Report: https://www.useinspectiq.com/sample-report
- Support: https://www.useinspectiq.com/support
- Sign Up: https://www.useinspectiq.com/auth/signup
`

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
