export function GET() {
  const body = `# InspectIQ
> Hire your first AI employee for $99/month — 13 AI agents that run your inspection business

## What is InspectIQ?
InspectIQ is an agentic AI platform for licensed home inspectors. Instead of just writing reports, InspectIQ gives every inspector a team of 13 AI agents that handle the work around the inspection — report writing, delivery, client follow-ups, review requests, realtor relationship management, scheduling, compliance tracking, and more. You inspect. They handle everything else.

## The 13 Agents
- **Report Writer** — generates professional narratives from notes and photos
- **Delivery Agent** — emails the finished report to client and buyer's agent on completion
- **Follow-Up Agent** — sends a personalized check-in after report delivery
- **Property Research Agent** — pulls building permit history before you arrive on site
- **Review Agent** — requests Google reviews from satisfied clients
- **Realtor Nurture Agent** — tracks referrals and sends automatic thank-you emails
- **Repair Summary Agent** — generates condensed repair lists for buyer's agents
- **Scheduling Agent** — manages availability and shareable booking pages
- **Compliance Agent** — tracks CE credits, license renewals, and insurance deadlines
- **Lead Qualifier Agent** — auto-responds to inquiries with quotes and booking
- **Business Intelligence Agent** — sends weekly/monthly business performance reports
- **After-Hours Agent** — handles emails outside business hours
- **Marketing Agent** — generates Google Business Profile posts from completed inspections

## Pricing
$99/month — all 13 agents included. Toggle each on or off. 14-day free trial, no credit card required.

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
