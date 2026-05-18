'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import PublicNav from '@/components/layout/PublicNav'
import {
  FileText, Zap, Clock, Mail, Star, Users, CalendarDays,
  CheckCircle2, ChevronDown, ChevronRight, Shield, Search,
  MessageSquare, Wrench, BarChart3, Phone, Brain, Megaphone,
  Bot, ArrowRight, Sparkles,
} from 'lucide-react'

// ─── Agent Data ──────────────────────────────────────────────────────────────

const agentCategories = [
  {
    name: 'Report & Delivery',
    agents: [
      { icon: FileText, title: 'Report Writer', description: 'Writes professional narratives from your findings — room by room, in seconds.' },
      { icon: Mail, title: 'Report Delivery', description: 'Sends finished reports to clients with branded emails and secure share links.' },
      { icon: Wrench, title: 'Repair Summaries', description: 'Generates prioritized repair lists with cost estimates for agents and buyers.' },
    ],
  },
  {
    name: 'Client & Realtor',
    agents: [
      { icon: MessageSquare, title: 'Client Follow-Ups', description: 'Sends check-in sequences after delivery — keeps you top-of-mind without lifting a finger.' },
      { icon: Star, title: 'Google Review Requests', description: 'Asks happy clients for Google reviews at the perfect time — growing your rating on autopilot.' },
      { icon: Users, title: 'Realtor Nurture', description: 'Maintains relationships with referring agents — birthday notes, market updates, thank-yous.' },
    ],
  },
  {
    name: 'Operations',
    agents: [
      { icon: CalendarDays, title: 'Scheduling & Booking', description: 'Your own branded booking page. Realtors pick a time, you get the job. No phone tag.' },
      { icon: Search, title: 'Property Research', description: 'Pulls permit history, prior sales, and property details before you arrive on-site.' },
      { icon: Shield, title: 'Compliance Tracking', description: 'Monitors license renewals, CE requirements, and insurance expirations so nothing lapses.' },
      { icon: Phone, title: 'After-Hours Email', description: 'Responds to inquiries nights and weekends — so leads never go cold.' },
    ],
  },
  {
    name: 'Growth',
    agents: [
      { icon: Brain, title: 'Lead Qualification', description: 'Scores incoming leads and routes hot ones to you first. No more wasting time on tire-kickers.' },
      { icon: BarChart3, title: 'Business Intelligence', description: 'Tracks revenue, inspection volume, agent referrals, and trends — your business at a glance.' },
      { icon: Megaphone, title: 'Marketing', description: 'Creates and publishes SEO content, social posts, and email campaigns to attract new clients.' },
    ],
  },
]

const steps = [
  { number: '1', title: 'Sign up in 2 minutes', description: 'No credit card. No setup calls. Just your email and you are in.' },
  { number: '2', title: 'Connect your tools', description: 'Link your email, calendar, and Stripe. Takes about 10 minutes.' },
  { number: '3', title: 'Your AI team gets to work', description: 'Agents start handling admin immediately. You focus on inspections.' },
]

const faqs = [
  {
    q: 'Is it really autonomous? Do the agents work without me?',
    a: 'Yes. Once configured, agents run on their own — sending follow-ups, requesting reviews, responding to inquiries, and more. You get a dashboard showing everything they do, and you can override or pause any agent at any time.',
  },
  {
    q: 'What if I only want some of the agents?',
    a: 'Every agent can be toggled on or off from your dashboard. Start with just the Report Writer if you want, then enable more as you get comfortable. You only use what you need.',
  },
  {
    q: 'Do I need to be technical?',
    a: 'Not at all. If you can send an email, you can use InspectIQ. There is no code to write, no integrations to build. Setup is a guided 10-minute walkthrough.',
  },
  {
    q: 'How is this different from Spectora or ISN?',
    a: 'Spectora and ISN are tools — they help you do work faster. InspectIQ is a workforce — it does the work for you. Spectora offers AI text suggestions. InspectIQ has 13 autonomous agents that actually execute tasks: writing reports, sending emails, requesting reviews, nurturing realtors, and marketing your business.',
  },
  {
    q: 'What happens after my 14-day trial?',
    a: 'If you love it, you pay $99/month — everything included, all 13 agents, unlimited inspections. If not, you walk away. No charge, no hassle, no awkward cancellation call.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Monthly billing, cancel with one click. No contracts, no termination fees.',
  },
]

const pricingFeatures = [
  'All 13 AI agents included',
  'Unlimited inspections & reports',
  'Branded booking page',
  'Automated client follow-ups',
  'Google review requests on autopilot',
  'Realtor nurture sequences',
  'After-hours email handling',
  'Business intelligence dashboard',
  'All future agents we build — free',
]

// ─── Animated Section Wrapper ────────────────────────────────────────────────

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.section>
  )
}

// ─── FAQ Accordion ───────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-slate-200 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left text-base font-medium text-slate-900 hover:text-blue-600 transition-colors"
      >
        {q}
        <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="pb-5 text-slate-600 leading-relaxed">{a}</p>}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AnimatedLanding() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <Badge variant="secondary" className="mb-6 text-sm font-medium px-4 py-1.5">
            <Bot className="mr-1.5 h-3.5 w-3.5" /> 13 AI Agents Working For You
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl leading-tight">
            Hire your first AI employee<br className="hidden sm:block" /> for $99/month
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 leading-relaxed">
            You do the inspections. Your AI team handles everything else — reports,
            follow-ups, review requests, scheduling, realtor nurture, and marketing.
            13 agents. Zero admin work.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-base font-semibold rounded-xl shadow-lg shadow-blue-600/20">
                Start your free trial <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <p className="text-sm text-slate-500">14-day free trial. No credit card required.</p>
          </div>
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-slate-500">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-500" /> No credit card</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-500" /> Cancel anytime</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-500" /> Setup in 10 min</span>
          </div>
        </div>
      </section>

      {/* ── Social Proof ── */}
      <Section className="py-12 bg-slate-50 border-y border-slate-100">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">
            Trusted by home inspectors across the country
          </p>
          {/* Placeholder for testimonials — replace when real quotes come in */}
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-slate-200 bg-white">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, j) => <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <p className="text-slate-600 text-sm italic">&quot;Testimonial coming soon&quot;</p>
                  <p className="mt-3 text-xs text-slate-400">— Inspector Name, State</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* ── How It Works ── */}
      <Section className="py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Up and running in 10 minutes</h2>
            <p className="mt-4 text-slate-600 text-lg">No onboarding calls. No implementation fee. No IT department.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xl font-bold mb-4">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Agent Showcase ── */}
      <Section className="py-20 md:py-28 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 text-sm px-3 py-1">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Your AI Workforce
            </Badge>
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">13 agents. One subscription.</h2>
            <p className="mt-4 text-slate-600 text-lg max-w-2xl mx-auto">
              Each agent handles a specific part of running your inspection business — autonomously, 24/7.
            </p>
          </div>
          <div className="space-y-12">
            {agentCategories.map((category) => (
              <div key={category.name}>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-4">{category.name}</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {category.agents.map((agent) => (
                    <Card key={agent.title} className="border-slate-200 hover:border-blue-200 hover:shadow-md transition-all">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            <agent.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900 text-sm">{agent.title}</h4>
                            <p className="mt-1 text-sm text-slate-600 leading-relaxed">{agent.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Scheduling Feature Highlight ── */}
      <Section className="py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div>
              <Badge variant="secondary" className="mb-4 text-sm px-3 py-1">
                <CalendarDays className="mr-1.5 h-3.5 w-3.5" /> Scheduling Agent
              </Badge>
              <h2 className="text-3xl font-bold text-slate-900">Your own branded booking page</h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Share a single link with realtors. They pick a time, enter the property address,
                and your calendar fills up — no phone tag, no back-and-forth texts.
              </p>
              <ul className="mt-6 space-y-3">
                {['Branded with your logo and colors', 'Syncs with your existing calendar', 'Collects property details upfront', 'Sends confirmation and reminders automatically'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 flex items-center justify-center min-h-[280px]">
              <div className="text-center text-slate-400">
                <CalendarDays className="h-16 w-16 mx-auto mb-3 text-blue-300" />
                <p className="text-sm">Booking page preview</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Pricing ── */}
      <Section className="py-20 md:py-28 bg-slate-50">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">One price. Everything included.</h2>
          <p className="mt-4 text-slate-600 text-lg">No per-agent fees. No usage limits. No surprises.</p>
          <Card className="mt-12 border-blue-200 shadow-lg shadow-blue-600/5">
            <CardContent className="p-8 md:p-12">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold text-slate-900">$99</span>
                <span className="text-xl text-slate-500">/month</span>
              </div>
              <p className="mt-2 text-slate-500">14-day free trial. No credit card required.</p>
              <div className="mt-8 grid gap-3 text-left max-w-sm mx-auto">
                {pricingFeatures.map((feature) => (
                  <div key={feature} className="flex items-center gap-2.5 text-sm text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
              <Link href="/sign-up">
                <Button size="lg" className="mt-10 bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-base font-semibold rounded-xl w-full sm:w-auto">
                  Start your free trial <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
          <p className="mt-6 text-sm text-slate-500">
            Compare: Spectora is $109/mo with zero AI agents. ISN is $49/mo with no report writing. InspectIQ gives you 13 autonomous agents for $99/mo.
          </p>
        </div>
      </Section>

      {/* ── FAQ ── */}
      <Section className="py-20 md:py-28">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center sm:text-4xl">Frequently asked questions</h2>
          <div className="mt-12">
            {faqs.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </Section>

      {/* ── Final CTA ── */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-blue-600 to-blue-700">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Stop doing admin work.<br />Start growing your business.
          </h2>
          <p className="mt-4 text-blue-100 text-lg">
            13 AI agents. $99/month. 14-day free trial. No credit card required.
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="mt-10 bg-white hover:bg-slate-50 text-blue-700 px-8 py-6 text-base font-semibold rounded-xl shadow-lg">
              Start your free trial <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-900 py-12">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div>
              <p className="text-lg font-bold text-white">InspectIQ</p>
              <p className="mt-1 text-sm text-slate-400">Your AI inspection workforce.</p>
            </div>
            <div className="flex gap-6 text-sm text-slate-400">
              <Link href="/sign-up" className="hover:text-white transition-colors">Sign Up</Link>
              <Link href="/sign-in" className="hover:text-white transition-colors">Log In</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
            &copy; {new Date().getFullYear()} InspectIQ. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
