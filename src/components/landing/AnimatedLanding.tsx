'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import PublicNav from '@/components/layout/PublicNav'
import {
  FileText, Zap, Clock, Mail, Star, Users, CalendarDays,
  CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Shield, Search,
  MessageSquare, Wrench, BarChart3, Phone, Brain, Megaphone,
  Bot, ArrowRight, Sparkles,
} from 'lucide-react'

// --- Agent Data ---

const agentCategories = [
  {
    name: 'Report & Delivery',
    agents: [
      { icon: FileText, title: 'Report Writer', description: 'Type your notes, get a professional narrative back in seconds. No more writing reports until midnight.' },
      { icon: Mail, title: 'Report Delivery', description: 'Report done? It sends itself. Branded email, secure link, PDF attached. Client gets it before you leave the driveway.' },
      { icon: Wrench, title: 'Repair Summaries', description: 'Auto-generates a clean repair list from your findings. Hand it to the realtor — they love you for it.' },
    ],
  },
  {
    name: 'Client & Realtor',
    agents: [
      { icon: MessageSquare, title: 'Client Follow-Ups', description: 'Checks in with your clients after delivery. "Any questions about the report?" — sent automatically, sounds like you.' },
      { icon: Star, title: 'Google Reviews', description: 'Asks happy clients for a Google review at the right time. Your rating goes up without you asking anyone.' },
      { icon: Users, title: 'Realtor Nurture', description: 'Keeps your referring agents warm. Thank-yous after jobs, check-ins when they go quiet. Referrals keep coming.' },
    ],
  },
  {
    name: 'Operations',
    agents: [
      { icon: CalendarDays, title: 'Scheduling', description: 'Give realtors a booking link. They pick a time, enter the address, done. No more phone tag.' },
      { icon: Search, title: 'Property Research', description: 'Pulls permit history and property details before you show up. Walk in prepared.' },
      { icon: Shield, title: 'Compliance', description: 'Tracks your license renewal, CE credits, and E&O expiration. Get reminded before anything lapses.' },
      { icon: Phone, title: 'After-Hours', description: 'Responds to emails at 10pm so you do not have to. Leads never go cold.' },
    ],
  },
  {
    name: 'Growth',
    agents: [
      { icon: Brain, title: 'Lead Qualification', description: 'Responds to inquiries, collects property details, and gives you a quote — before you even see the email.' },
      { icon: BarChart3, title: 'Business Intelligence', description: 'Monthly report: how many inspections, revenue trends, top referring agents. Know your numbers.' },
      { icon: Megaphone, title: 'Marketing', description: 'Turns your completed inspections into social posts and Google Business updates. Stay visible without the effort.' },
    ],
  },
]

const steps = [
  {
    number: '1',
    title: 'Create your account',
    description: 'Email and password. That is it. No credit card, no sales call, no 30-minute demo.',
    screenshot: '/screenshots/step-signup.png',
    screenshotAlt: 'InspectIQ signup screen',
  },
  {
    number: '2',
    title: 'Connect your email and calendar',
    description: 'Link Gmail or Outlook so your agents can send from your address and manage your schedule. About 10 minutes.',
    screenshot: '/screenshots/step-connect.png',
    screenshotAlt: 'InspectIQ settings page showing connected accounts',
  },
  {
    number: '3',
    title: 'Run your first inspection',
    description: 'Create an inspection, walk the property, type your notes. Your AI team handles the rest — report, delivery, follow-up, review request.',
    screenshot: '/screenshots/step-inspection.png',
    screenshotAlt: 'InspectIQ inspection editor with AI-generated narrative',
  },
]

const faqs = [
  {
    q: 'Do the agents actually work without me doing anything?',
    a: 'Yes. Once you set your preferences, they run on their own — sending follow-ups, requesting reviews, responding to inquiries. You get a dashboard showing everything they did, and you can pause or override any agent anytime.',
  },
  {
    q: 'What if I only want the report writer for now?',
    a: 'Every agent has an on/off switch. Start with just the Report Writer. Turn on more when you are ready. You are always in control.',
  },
  {
    q: 'I am not great with technology. Can I still use this?',
    a: 'If you can send an email, you can use InspectIQ. No code, no technical setup. The onboarding walks you through everything step by step.',
  },
  {
    q: 'What happens after the 14-day trial?',
    a: 'If you want to keep going, it is $99/month — everything included, all 13 agents, unlimited inspections and reports. If not, you walk away. No charge, no cancellation call.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Monthly billing, cancel with one click. No contracts, no termination fees, no guilt trip.',
  },
  {
    q: 'I already use Spectora / ISN / HomeGauge. Why switch?',
    a: 'Those tools help you do work faster. InspectIQ does the work for you. You still use whatever inspection software you like on-site — InspectIQ handles everything that happens after: reports, delivery, follow-ups, reviews, scheduling, marketing.',
  },
]

const pricingFeatures = [
  'All 13 AI agents',
  'Unlimited inspections & reports',
  'Your own branded booking page',
  'Automated follow-ups & review requests',
  'Realtor relationship management',
  'After-hours email handling',
  'Business intelligence dashboard',
  'Every new agent we build — included',
]

// --- Animated Section Wrapper ---

function Section({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.section
      id={id}
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

// --- Screenshot component with fallback ---

function Screenshot({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <div className={`rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center ${className}`}>
        <p className="text-sm text-slate-400 px-4 text-center">Screenshot: {alt}</p>
      </div>
    )
  }

  return (
    <div className={`rounded-xl border border-slate-200 shadow-lg overflow-hidden bg-white ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={800}
        height={500}
        className="w-full h-auto"
        onError={() => setHasError(true)}
      />
    </div>
  )
}

// --- How It Works Carousel ---

function HowItWorksCarousel() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)

  const goTo = useCallback((index: number) => {
    setDirection(index > current ? 1 : -1)
    setCurrent(index)
  }, [current])

  const next = useCallback(() => {
    setDirection(1)
    setCurrent((prev) => (prev + 1) % steps.length)
  }, [])

  const prev = useCallback(() => {
    setDirection(-1)
    setCurrent((prev) => (prev - 1 + steps.length) % steps.length)
  }, [])

  // Auto-advance every 5 seconds
  useEffect(() => {
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next])

  const step = steps[current]

  return (
    <div className="mx-auto max-w-5xl px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Up and running in 10 minutes</h2>
        <p className="mt-4 text-slate-600 text-lg">No onboarding calls. No setup fees. No IT department needed.</p>
      </div>

      {/* Step indicators */}
      <div className="flex justify-center gap-4 mb-10">
        {steps.map((s, i) => (
          <button
            key={s.number}
            onClick={() => goTo(i)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              i === current
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
              i === current ? 'bg-white text-blue-600' : 'bg-slate-200 text-slate-500'
            }`}>
              {s.number}
            </span>
            <span className="hidden sm:inline">{s.title}</span>
          </button>
        ))}
      </div>

      {/* Carousel content */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            initial={{ opacity: 0, x: direction * 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -100 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="grid gap-8 md:grid-cols-2 items-center"
          >
            <div className="order-2 md:order-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white text-lg font-bold">
                  {step.number}
                </span>
                <h3 className="text-2xl font-bold text-slate-900">{step.title}</h3>
              </div>
              <p className="text-lg text-slate-600 leading-relaxed">{step.description}</p>
            </div>
            <div className="order-1 md:order-2">
              <Screenshot
                src={step.screenshot}
                alt={step.screenshotAlt}
                className="min-h-[240px]"
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Nav arrows */}
        <button
          onClick={prev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-6 bg-white border border-slate-200 rounded-full p-2 shadow-md hover:bg-slate-50 transition-colors z-10"
          aria-label="Previous step"
        >
          <ChevronLeft className="h-5 w-5 text-slate-600" />
        </button>
        <button
          onClick={next}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-6 bg-white border border-slate-200 rounded-full p-2 shadow-md hover:bg-slate-50 transition-colors z-10"
          aria-label="Next step"
        >
          <ChevronRight className="h-5 w-5 text-slate-600" />
        </button>
      </div>
    </div>
  )
}

// --- FAQ Accordion ---

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

// --- Main Component ---

export default function AnimatedLanding() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* -- Hero -- */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div>
              <Badge variant="secondary" className="mb-6 text-sm font-medium px-4 py-1.5">
                <Bot className="mr-1.5 h-3.5 w-3.5" /> Built for home inspectors
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl leading-tight">
                Stop writing reports at midnight.
              </h1>
              <p className="mt-6 text-lg text-slate-600 leading-relaxed">
                You walk the property. InspectIQ handles everything after — the report,
                delivery, client follow-ups, review requests, scheduling, and marketing.
                13 AI agents working for you, $99/month.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link href="/auth/signup">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-base font-semibold rounded-xl shadow-lg shadow-blue-600/20">
                    Try it free for 14 days <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <p className="text-sm text-slate-500">No credit card required.</p>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-slate-500">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-500" /> Unlimited inspections</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-500" /> Cancel anytime</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-500" /> Setup in 10 min</span>
              </div>
            </div>
            <div>
              <Screenshot
                src="/screenshots/hero-dashboard.png"
                alt="InspectIQ dashboard showing active agents and recent inspections"
                className="min-h-[300px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* -- The Problem -- */}
      <Section className="py-16 md:py-20 bg-slate-50 border-y border-slate-100" id="features">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center sm:text-4xl">
            You did not get into this business to sit at a desk
          </h2>
          <p className="mt-4 text-center text-slate-600 text-lg max-w-2xl mx-auto">
            But that is where the hours go — writing reports, chasing follow-ups, asking for reviews, playing phone tag with realtors.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              { icon: Clock, stat: '2-4 hours', label: 'spent writing every report' },
              { icon: Mail, stat: '60%', label: 'of inspectors never follow up with clients' },
              { icon: Star, stat: '5x', label: 'more bookings with 50+ Google reviews' },
            ].map((item) => (
              <div key={item.label} className="text-center p-6 rounded-xl bg-white border border-slate-200">
                <item.icon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <p className="text-2xl font-bold text-slate-900">{item.stat}</p>
                <p className="mt-1 text-sm text-slate-600">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* -- How It Works Carousel -- */}
      <Section className="py-20 md:py-28">
        <HowItWorksCarousel />
      </Section>

      {/* -- Product Screenshots -- */}
      <Section className="py-16 md:py-24 bg-slate-50">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">See it in action</h2>
            <p className="mt-4 text-slate-600 text-lg">Real screenshots from inside the app.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <Screenshot
                src="/screenshots/report-writer.png"
                alt="AI report writer generating a narrative from inspection notes"
                className="min-h-[220px]"
              />
              <h3 className="mt-4 font-semibold text-slate-900">AI Report Writer</h3>
              <p className="text-sm text-slate-600">Type your notes, get a professional narrative in seconds. Edit if you want, or send as-is.</p>
            </div>
            <div>
              <Screenshot
                src="/screenshots/agents-page.png"
                alt="Agents dashboard showing toggleable AI agents"
                className="min-h-[220px]"
              />
              <h3 className="mt-4 font-semibold text-slate-900">Your AI Team</h3>
              <p className="text-sm text-slate-600">Toggle each agent on or off. Configure how they work. You are always in control.</p>
            </div>
            <div>
              <Screenshot
                src="/screenshots/booking-page.png"
                alt="Branded booking page where realtors schedule inspections"
                className="min-h-[220px]"
              />
              <h3 className="mt-4 font-semibold text-slate-900">Branded Booking Page</h3>
              <p className="text-sm text-slate-600">Share one link with realtors. They pick a time and enter the address. No phone tag.</p>
            </div>
            <div>
              <Screenshot
                src="/screenshots/sample-report.png"
                alt="Professional inspection report generated by InspectIQ"
                className="min-h-[220px]"
              />
              <h3 className="mt-4 font-semibold text-slate-900">Professional Reports</h3>
              <p className="text-sm text-slate-600">Clean, branded reports your clients will actually read. Photos, findings, repair summaries included.</p>
            </div>
          </div>
        </div>
      </Section>

      {/* -- Agent Showcase -- */}
      <Section className="py-20 md:py-28" id="agents">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 text-sm px-3 py-1">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" /> All included at $99/mo
            </Badge>
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">13 agents that run your business</h2>
            <p className="mt-4 text-slate-600 text-lg max-w-2xl mx-auto">
              Each one handles a specific job — reports, follow-ups, reviews, scheduling, marketing. Turn on what you need.
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

      {/* -- Pricing -- */}
      <Section className="py-20 md:py-28 bg-slate-50" id="pricing">
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
              <Link href="/auth/signup">
                <Button size="lg" className="mt-10 bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-base font-semibold rounded-xl w-full sm:w-auto">
                  Start your free trial <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* -- Founding Members -- */}
      <Section className="py-16 md:py-20" id="founding">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <Badge variant="secondary" className="mb-4 text-sm px-3 py-1 bg-amber-50 text-amber-700 border-amber-200">
            Limited — 50 spots
          </Badge>
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Founding member pricing</h2>
          <p className="mt-4 text-slate-600 text-lg">
            Sign up now and lock in $99/month forever. When we raise the price, yours stays the same. First 50 inspectors only.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-base font-semibold rounded-xl shadow-lg shadow-blue-600/20">
              Claim your spot <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Section>

      {/* -- FAQ -- */}
      <Section className="py-20 md:py-28 bg-slate-50">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center sm:text-4xl">Common questions</h2>
          <div className="mt-12">
            {faqs.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </Section>

      {/* -- Final CTA -- */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-blue-600 to-blue-700">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            You handle the inspections.<br />Let your AI team handle the rest.
          </h2>
          <p className="mt-4 text-blue-100 text-lg">
            13 agents. $99/month. 14-day free trial. No credit card.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="mt-10 bg-white hover:bg-slate-50 text-blue-700 px-8 py-6 text-base font-semibold rounded-xl shadow-lg">
              Start your free trial <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* -- Footer -- */}
      <footer className="bg-slate-900 py-12">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div>
              <p className="text-lg font-bold text-white">InspectIQ</p>
              <p className="mt-1 text-sm text-slate-400">AI that runs your inspection business.</p>
            </div>
            <div className="flex gap-6 text-sm text-slate-400">
              <Link href="/auth/signup" className="hover:text-white transition-colors">Sign Up</Link>
              <Link href="/auth/login" className="hover:text-white transition-colors">Log In</Link>
              <Link href="/sample-report" className="hover:text-white transition-colors">Sample Report</Link>
              <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
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
