'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import PublicNav from '@/components/layout/PublicNav'
import {
  FileText, Zap, Clock, Mail, Star, Users, CalendarDays,
  CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Shield, Search,
  MessageSquare, Wrench, BarChart3, Phone, Brain, Megaphone,
  Bot, ArrowRight, Sparkles, Circle, ToggleRight, Download,
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
    mockup: 'signup' as const,
  },
  {
    number: '2',
    title: 'Connect your email and calendar',
    description: 'Link Gmail or Outlook so your agents can send from your address and manage your schedule. About 10 minutes.',
    mockup: 'connect' as const,
  },
  {
    number: '3',
    title: 'Run your first inspection',
    description: 'Create an inspection, walk the property, type your notes. Your AI team handles the rest — report, delivery, follow-up, review request.',
    mockup: 'inspection' as const,
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

// --- App Mockup Components (inline UI previews instead of screenshots) ---

function MockupChrome({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 shadow-lg overflow-hidden bg-white">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 border-b border-slate-200">
        <div className="flex gap-1.5">
          <Circle className="h-2.5 w-2.5 fill-red-400 text-red-400" />
          <Circle className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
          <Circle className="h-2.5 w-2.5 fill-green-400 text-green-400" />
        </div>
        {title && <span className="text-[10px] text-slate-400 ml-2 font-mono">{title}</span>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function HeroDashboardMockup() {
  return (
    <MockupChrome title="useinspectiq.com/dashboard">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Dashboard</p>
            <p className="text-[10px] text-slate-400">Welcome back, James</p>
          </div>
          <div className="flex gap-1">
            <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">5 agents active</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'This Month', value: '12', sub: 'inspections' },
            { label: 'Reports Sent', value: '11', sub: 'delivered' },
            { label: 'Reviews', value: '4.9', sub: '28 reviews' },
          ].map((s) => (
            <div key={s.label} className="bg-slate-50 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-slate-900">{s.value}</p>
              <p className="text-[9px] text-slate-500">{s.sub}</p>
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Recent Inspections</p>
          {[
            { addr: '2847 Oakwood Dr, Columbus', status: 'Sent', color: 'text-blue-600 bg-blue-50' },
            { addr: '1204 Maple Lane, Dublin', status: 'Completed', color: 'text-green-600 bg-green-50' },
            { addr: '890 Elm St, Westerville', status: 'In Progress', color: 'text-amber-600 bg-amber-50' },
          ].map((r) => (
            <div key={r.addr} className="flex items-center justify-between bg-white border border-slate-100 rounded-lg px-2.5 py-1.5">
              <span className="text-[10px] text-slate-700 truncate">{r.addr}</span>
              <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${r.color}`}>{r.status}</span>
            </div>
          ))}
        </div>
      </div>
    </MockupChrome>
  )
}

function SignupMockup() {
  return (
    <MockupChrome title="useinspectiq.com/auth/signup">
      <div className="max-w-[220px] mx-auto space-y-3 py-2">
        <div className="text-center">
          <p className="text-sm font-bold text-slate-900">Start your free trial</p>
          <p className="text-[9px] text-slate-400">No credit card required</p>
        </div>
        {['Full name', 'Email address', 'Password'].map((f) => (
          <div key={f}>
            <p className="text-[9px] text-slate-500 mb-0.5">{f}</p>
            <div className="h-7 rounded-md border border-slate-200 bg-slate-50" />
          </div>
        ))}
        <div className="h-8 rounded-md bg-blue-600 flex items-center justify-center">
          <span className="text-[10px] text-white font-medium">Create Account</span>
        </div>
        <p className="text-[8px] text-slate-400 text-center">14-day free trial, then $99/month</p>
      </div>
    </MockupChrome>
  )
}

function ConnectMockup() {
  return (
    <MockupChrome title="useinspectiq.com/dashboard/agents">
      <div className="space-y-3">
        <p className="text-sm font-semibold text-slate-900">Connect Your Accounts</p>
        {[
          { name: 'Google (Gmail + Calendar)', connected: true, icon: '🔗' },
          { name: 'Microsoft Outlook', connected: false, icon: '📧' },
        ].map((a) => (
          <div key={a.name} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-sm">{a.icon}</span>
              <span className="text-[10px] font-medium text-slate-700">{a.name}</span>
            </div>
            {a.connected ? (
              <span className="text-[9px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded">Connected</span>
            ) : (
              <span className="text-[9px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded cursor-pointer">Connect</span>
            )}
          </div>
        ))}
        <div className="mt-2 bg-blue-50 border border-blue-100 rounded-lg p-2">
          <p className="text-[9px] text-blue-700">Your agents will send emails from your connected account — clients see your name and email, not ours.</p>
        </div>
      </div>
    </MockupChrome>
  )
}

function InspectionMockup() {
  return (
    <MockupChrome title="useinspectiq.com/dashboard/inspections/edit">
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900">Roof System</p>
          <span className="text-[9px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded font-medium">Auto-saved</span>
        </div>
        {[
          { name: 'Asphalt Shingles', cond: 'Good', color: 'bg-green-500' },
          { name: 'Gutters & Downspouts', cond: 'Fair', color: 'bg-amber-500' },
          { name: 'Chimney Flashing', cond: 'Fair', color: 'bg-amber-500' },
        ].map((item) => (
          <div key={item.name} className="flex items-center gap-2 bg-slate-50 rounded-lg px-2.5 py-1.5 border border-slate-100">
            <div className={`h-2 w-2 rounded-full ${item.color}`} />
            <span className="text-[10px] text-slate-700 flex-1">{item.name}</span>
            <span className="text-[9px] text-slate-500">{item.cond}</span>
          </div>
        ))}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="h-3 w-3 text-blue-600" />
            <span className="text-[10px] font-semibold text-blue-700">AI Narrative</span>
          </div>
          <p className="text-[9px] text-slate-600 leading-relaxed">
            The roof system was inspected from ground level. Asphalt shingle roofing is in overall satisfactory condition with an estimated 5-7 years of remaining service life...
          </p>
        </div>
      </div>
    </MockupChrome>
  )
}

function ReportWriterMockup() {
  return (
    <MockupChrome title="AI Report Writer">
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-900">Kitchen</p>
          <span className="text-[9px] text-slate-400">4 items inspected</span>
        </div>
        <div className="space-y-1">
          {[
            { name: 'Cabinets & Countertops', cond: 'Good' },
            { name: 'Kitchen Sink & Drain', cond: 'Fair', note: 'Slow drain' },
            { name: 'GFCI Outlets', cond: 'Good' },
          ].map((i) => (
            <div key={i.name} className="text-[9px] text-slate-600 flex items-center gap-1.5">
              <CheckCircle2 className={`h-2.5 w-2.5 ${i.cond === 'Good' ? 'text-green-500' : 'text-amber-500'}`} />
              {i.name} {i.note && <span className="text-slate-400">— {i.note}</span>}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-6 rounded bg-blue-600 flex items-center px-2 gap-1">
            <Sparkles className="h-2.5 w-2.5 text-white" />
            <span className="text-[9px] text-white font-medium">Generate Narrative</span>
          </div>
          <div className="h-1.5 flex-1 bg-blue-200 rounded-full overflow-hidden">
            <div className="h-full w-3/4 bg-blue-500 rounded-full" />
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
          <p className="text-[9px] text-slate-600 leading-relaxed italic">
            &quot;The kitchen is in good overall condition. Cabinets and countertops show typical wear consistent with the age of the home. A slow drain was noted at the kitchen sink — this should be cleared prior to closing...&quot;
          </p>
        </div>
      </div>
    </MockupChrome>
  )
}

function AgentsPageMockup() {
  return (
    <MockupChrome title="useinspectiq.com/dashboard/agents">
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-900">Your AI Team</p>
        {[
          { name: 'Report Writer', on: true, icon: FileText },
          { name: 'Report Delivery', on: true, icon: Mail },
          { name: 'Client Follow-Ups', on: true, icon: MessageSquare },
          { name: 'Google Reviews', on: false, icon: Star },
          { name: 'Scheduling', on: true, icon: CalendarDays },
          { name: 'After-Hours', on: false, icon: Phone },
        ].map((a) => (
          <div key={a.name} className="flex items-center justify-between bg-slate-50 rounded-lg px-2.5 py-1.5 border border-slate-100">
            <div className="flex items-center gap-2">
              <a.icon className={`h-3 w-3 ${a.on ? 'text-blue-600' : 'text-slate-300'}`} />
              <span className={`text-[10px] font-medium ${a.on ? 'text-slate-700' : 'text-slate-400'}`}>{a.name}</span>
            </div>
            <ToggleRight className={`h-4 w-4 ${a.on ? 'text-blue-600' : 'text-slate-300'}`} />
          </div>
        ))}
      </div>
    </MockupChrome>
  )
}

function BookingPageMockup() {
  return (
    <MockupChrome title="book.useinspectiq.com/james-whitfield">
      <div className="space-y-2.5">
        <div className="text-center">
          <p className="text-xs font-bold text-slate-900">Summit Home Inspections</p>
          <p className="text-[9px] text-slate-400">James Whitfield, HI-OH-4821</p>
        </div>
        <div>
          <p className="text-[9px] text-slate-500 mb-1">Select a date</p>
          <div className="grid grid-cols-7 gap-0.5 text-center">
            {['M','T','W','T','F','S','S'].map((d,i) => (
              <span key={i} className="text-[8px] text-slate-400 font-medium">{d}</span>
            ))}
            {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
              <span
                key={d}
                className={`text-[8px] py-0.5 rounded ${
                  d === 15 ? 'bg-blue-600 text-white font-bold' :
                  [6,7,13,14,20,21,27,28].includes(d) ? 'text-slate-300' :
                  'text-slate-600 hover:bg-blue-50'
                }`}
              >
                {d}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[9px] text-slate-500 mb-1">Available times</p>
          <div className="flex flex-wrap gap-1">
            {['9:00 AM', '10:30 AM', '1:00 PM', '3:00 PM'].map((t) => (
              <span key={t} className={`text-[8px] px-1.5 py-0.5 rounded border ${t === '10:30 AM' ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-600'}`}>{t}</span>
            ))}
          </div>
        </div>
        <div className="h-6 rounded bg-blue-600 flex items-center justify-center">
          <span className="text-[9px] text-white font-medium">Book Inspection</span>
        </div>
      </div>
    </MockupChrome>
  )
}

function SampleReportMockup() {
  return (
    <MockupChrome title="InspectIQ Report — PDF Preview">
      <div className="space-y-2.5">
        <div className="text-center border-b border-slate-100 pb-2">
          <p className="text-xs font-bold text-slate-900">Home Inspection Report</p>
          <p className="text-[9px] text-slate-400">2847 Oakwood Drive, Columbus, OH 43214</p>
          <p className="text-[8px] text-slate-400">Prepared by Summit Home Inspections</p>
        </div>
        <div>
          <p className="text-[9px] font-semibold text-slate-700 mb-1">Summary of Findings</p>
          <div className="flex gap-2 mb-2">
            <span className="text-[8px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-medium">3 Critical</span>
            <span className="text-[8px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-medium">5 Fair</span>
            <span className="text-[8px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded font-medium">26 Good</span>
          </div>
        </div>
        <div className="space-y-1.5">
          {[
            { section: 'Roof System', items: '5 items', badge: '1 fair' },
            { section: 'Electrical', items: '4 items', badge: '1 critical' },
            { section: 'HVAC', items: '4 items', badge: '1 fair' },
          ].map((s) => (
            <div key={s.section} className="flex items-center justify-between bg-slate-50 rounded px-2 py-1.5 border border-slate-100">
              <div>
                <p className="text-[9px] font-medium text-slate-700">{s.section}</p>
                <p className="text-[8px] text-slate-400">{s.items}</p>
              </div>
              <span className="text-[8px] text-amber-600">{s.badge}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-1.5 pt-1">
          <Download className="h-3 w-3 text-blue-600" />
          <span className="text-[9px] text-blue-600 font-medium">Download Full PDF</span>
        </div>
      </div>
    </MockupChrome>
  )
}

function StepMockup({ type }: { type: 'signup' | 'connect' | 'inspection' }) {
  switch (type) {
    case 'signup': return <SignupMockup />
    case 'connect': return <ConnectMockup />
    case 'inspection': return <InspectionMockup />
  }
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
              <StepMockup type={step.mockup} />
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

// --- Pricing Section with Annual Toggle ---

function PricingSection() {
  const [annual, setAnnual] = useState(false)
  const price = annual ? 79 : 99
  const billingLabel = annual ? 'billed annually ($948/yr)' : 'billed monthly'

  return (
    <Section className="py-20 md:py-28 bg-slate-50" id="pricing">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">One price. Everything included.</h2>
        <p className="mt-4 text-slate-600 text-lg">No per-agent fees. No usage limits. No surprises.</p>

        {/* Toggle */}
        <div className="mt-8 inline-flex items-center gap-3 bg-white border border-slate-200 rounded-full px-4 py-2">
          <span className={`text-sm font-medium ${!annual ? 'text-slate-900' : 'text-slate-400'}`}>Monthly</span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative w-11 h-6 rounded-full transition-colors ${annual ? 'bg-blue-600' : 'bg-slate-300'}`}
            role="switch"
            aria-checked={annual}
          >
            <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${annual ? 'translate-x-5' : ''}`} />
          </button>
          <span className={`text-sm font-medium ${annual ? 'text-slate-900' : 'text-slate-400'}`}>
            Annual <span className="text-green-600 text-xs font-semibold">Save $240</span>
          </span>
        </div>

        <Card className="mt-8 border-blue-200 shadow-lg shadow-blue-600/5">
          <CardContent className="p-8 md:p-12">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-bold text-slate-900">${price}</span>
              <span className="text-xl text-slate-500">/month</span>
            </div>
            <p className="mt-2 text-slate-500">14-day free trial · No credit card required · {billingLabel}</p>
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
              <HeroDashboardMockup />
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

      {/* -- Product Previews -- */}
      <Section className="py-16 md:py-24 bg-slate-50">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">See it in action</h2>
            <p className="mt-4 text-slate-600 text-lg">What your dashboard actually looks like.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <ReportWriterMockup />
              <h3 className="mt-4 font-semibold text-slate-900">AI Report Writer</h3>
              <p className="text-sm text-slate-600">Type your notes, get a professional narrative in seconds. Edit if you want, or send as-is.</p>
            </div>
            <div>
              <AgentsPageMockup />
              <h3 className="mt-4 font-semibold text-slate-900">Your AI Team</h3>
              <p className="text-sm text-slate-600">Toggle each agent on or off. Configure how they work. You are always in control.</p>
            </div>
            <div>
              <BookingPageMockup />
              <h3 className="mt-4 font-semibold text-slate-900">Branded Booking Page</h3>
              <p className="text-sm text-slate-600">Share one link with realtors. They pick a time and enter the address. No phone tag.</p>
            </div>
            <div>
              <SampleReportMockup />
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

      {/* -- Social Proof -- */}
      <Section className="py-16 md:py-20 border-y border-slate-100">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid gap-8 md:grid-cols-3 text-center">
            <div>
              <p className="text-3xl font-bold text-slate-900">50+</p>
              <p className="text-sm text-slate-500 mt-1">States with active inspectors</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">13</p>
              <p className="text-sm text-slate-500 mt-1">AI agents included</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">10 min</p>
              <p className="text-sm text-slate-500 mt-1">Setup time, start to finish</p>
            </div>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <p className="text-slate-700 text-sm leading-relaxed italic">&quot;I used to spend 3-4 hours on every report. Now I type my notes on-site and the AI handles the rest. My clients get the report before I leave the driveway.&quot;</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">JW</div>
                <div>
                  <p className="text-sm font-medium text-slate-900">James W.</p>
                  <p className="text-xs text-slate-400">Home Inspector, Ohio</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <p className="text-slate-700 text-sm leading-relaxed italic">&quot;The follow-up and review request agents are game changers. My Google reviews went from 12 to 28 in two months without me doing anything.&quot;</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-bold">MR</div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Miguel R.</p>
                  <p className="text-xs text-slate-400">Home Inspector, Texas</p>
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-slate-400 mt-6">Compatible with InterNACHI, ASHI, and TREC standards</p>
        </div>
      </Section>

      {/* -- Pricing -- */}
      <PricingSection />

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
