'use client'

import { useRef } from 'react'
import Link from 'next/link'
import {
  motion,
  useScroll,
  useTransform,
  useInView,
} from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  FileText, Zap, Clock, Shield, Star,
  ChevronRight, CheckCircle2, Building2,
  Download, Share2, Mail, PenLine,
} from 'lucide-react'

// ─── Data ────────────────────────────────────────────────────────────────────

const features = [
  { icon: Zap, title: 'AI-Powered Narratives', description: 'Enter your findings room by room. Claude AI instantly writes professional, detailed report narratives — the kind that used to take hours.' },
  { icon: Clock, title: 'Reports in Minutes', description: 'Cut report writing time by 80%. Finish your report on-site and deliver it to clients the same day.' },
  { icon: FileText, title: 'Branded PDF Reports', description: 'Every report includes your company logo, license number, and contact info. Professional output that builds trust.' },
  { icon: Mail, title: 'Email Reports to Clients', description: 'Send the finished report directly to your client with one click. No copying links, no back-and-forth — they get it instantly.' },
  { icon: PenLine, title: 'Your Signature on Every Report', description: 'Upload your signature once and it appears on every PDF you generate. Looks professional, builds trust, takes 30 seconds to set up.' },
  { icon: Shield, title: 'InterNACHI Standards Built-In', description: 'Pre-loaded with InterNACHI Standards of Practice checklists. Your reports reflect the highest industry standards, automatically.' },
  { icon: Share2, title: 'Secure Client Share Links', description: 'Share a secure link or download a PDF — clients get their report immediately, not 48 hours later.' },
  { icon: Download, title: 'Works in the Field', description: 'Fully mobile-responsive. Use it on your phone at the property, or back at the office on your desktop. No app download required.' },
]

const testimonials = [
  { name: 'Marcus T.', role: 'Independent Inspector — Dallas, TX', body: 'I used to spend 2–3 hours writing reports after every inspection. InspectIQ cuts that to 20 minutes. I take more jobs and still make it home for dinner.', rating: 5 },
  { name: 'Sandra R.', role: 'Certified Inspector — Atlanta, GA', body: 'My clients actually compliment my reports now. The AI narratives are thorough and professional. This pays for itself on the first inspection.', rating: 5 },
  { name: 'Dave K.', role: 'Home Inspector, 14 years — Phoenix, AZ', body: "I was skeptical about AI but InspectIQ nailed it. The language is accurate and sounds like me. I wouldn't go back.", rating: 5 },
]

const pricingFeatures = [
  'Unlimited inspections & reports',
  'AI-generated professional narratives (Claude AI)',
  'InterNACHI standards pre-loaded',
  'Email reports directly to clients',
  'Your signature on every PDF',
  'Drag-and-drop photo uploads',
  'Branded PDF with your logo',
  'Secure client share links',
  'Mobile-friendly — works in the field',
  'Cancel anytime',
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function FadeInWhenVisible({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  )
}

// The "go inside the house" scroll section
function HouseJourney() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 2.2])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.45, 0.55], [1, 1, 0.3, 0])
  const interiorOpacity = useTransform(scrollYProgress, [0.55, 0.75], [0, 1])
  const interiorY = useTransform(scrollYProgress, [0.55, 0.75], [40, 0])
  const textY = useTransform(scrollYProgress, [0, 0.4], [0, -60])

  const rooms = [
    { emoji: '🔌', label: 'Electrical', color: 'bg-amber-50 border-amber-200 text-amber-700' },
    { emoji: '🚿', label: 'Plumbing', color: 'bg-blue-50 border-blue-200 text-blue-700' },
    { emoji: '🔥', label: 'HVAC', color: 'bg-orange-50 border-orange-200 text-orange-700' },
    { emoji: '🏗️', label: 'Structure', color: 'bg-slate-50 border-slate-200 text-slate-700' },
    { emoji: '🍳', label: 'Kitchen', color: 'bg-green-50 border-green-200 text-green-700' },
    { emoji: '🛁', label: 'Bathrooms', color: 'bg-purple-50 border-purple-200 text-purple-700' },
  ]

  return (
    <section
      ref={containerRef}
      className="relative h-[200vh] bg-gradient-to-b from-slate-900 to-slate-800 overflow-hidden"
    >
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Exterior view — zooms in on scroll */}
        <motion.div
          style={{ scale, opacity }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="relative select-none">
            {/* House SVG illustration */}
            <svg width="480" height="380" viewBox="0 0 480 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl">
              {/* Sky gradient */}
              <defs>
                <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1e3a5f" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              {/* Ground */}
              <rect x="0" y="300" width="480" height="80" fill="#1e293b" />
              <rect x="0" y="295" width="480" height="10" fill="#334155" />
              {/* House body */}
              <rect x="100" y="180" width="280" height="150" fill="#1e40af" rx="2" />
              <rect x="100" y="180" width="280" height="150" fill="url(#houseGrad)" rx="2" />
              <defs>
                <linearGradient id="houseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1d4ed8" />
                  <stop offset="100%" stopColor="#1e3a8a" />
                </linearGradient>
              </defs>
              {/* Roof */}
              <polygon points="80,180 240,60 400,180" fill="#0f172a" />
              <polygon points="80,180 240,60 400,180" fill="#1e293b" />
              {/* Roof highlight */}
              <line x1="240" y1="60" x2="80" y2="180" stroke="#334155" strokeWidth="3" />
              <line x1="240" y1="60" x2="400" y2="180" stroke="#334155" strokeWidth="3" />
              {/* Chimney */}
              <rect x="320" y="80" width="30" height="60" fill="#0f172a" />
              <rect x="316" y="76" width="38" height="10" fill="#1e293b" />
              {/* Chimney smoke puffs */}
              <circle cx="335" cy="65" r="8" fill="#374151" opacity="0.5" />
              <circle cx="340" cy="50" r="6" fill="#374151" opacity="0.3" />
              <circle cx="332" cy="38" r="4" fill="#374151" opacity="0.2" />
              {/* Windows — lit up */}
              <rect x="130" y="210" width="70" height="55" fill="#fbbf24" rx="3" opacity="0.9" />
              <rect x="130" y="210" width="70" height="55" fill="#f59e0b" rx="3" opacity="0.4" />
              <line x1="165" y1="210" x2="165" y2="265" stroke="#92400e" strokeWidth="2" />
              <line x1="130" y1="237" x2="200" y2="237" stroke="#92400e" strokeWidth="2" />
              <rect x="280" y="210" width="70" height="55" fill="#fbbf24" rx="3" opacity="0.9" />
              <rect x="280" y="210" width="70" height="55" fill="#f59e0b" rx="3" opacity="0.4" />
              <line x1="315" y1="210" x2="315" y2="265" stroke="#92400e" strokeWidth="2" />
              <line x1="280" y1="237" x2="350" y2="237" stroke="#92400e" strokeWidth="2" />
              {/* Door */}
              <rect x="195" y="240" width="90" height="90" fill="#0f172a" rx="2" />
              <rect x="198" y="243" width="84" height="84" fill="#1e293b" rx="1" />
              <circle cx="277" cy="285" r="5" fill="#fbbf24" />
              {/* Door window */}
              <rect x="220" y="250" width="40" height="28" fill="#fbbf24" rx="2" opacity="0.6" />
              {/* Walkway */}
              <rect x="220" y="330" width="40" height="30" fill="#334155" />
              {/* Trees */}
              <ellipse cx="55" cy="250" rx="35" ry="50" fill="#064e3b" />
              <rect x="50" y="295" width="10" height="35" fill="#78350f" />
              <ellipse cx="420" cy="255" rx="30" ry="45" fill="#064e3b" />
              <rect x="415" y="295" width="10" height="30" fill="#78350f" />
              {/* Stars */}
              <circle cx="80" cy="30" r="2" fill="white" opacity="0.8" />
              <circle cx="150" cy="15" r="1.5" fill="white" opacity="0.6" />
              <circle cx="380" cy="25" r="2" fill="white" opacity="0.7" />
              <circle cx="430" cy="50" r="1.5" fill="white" opacity="0.5" />
              <circle cx="50" cy="70" r="1" fill="white" opacity="0.5" />
            </svg>
          </div>
        </motion.div>

        {/* Text overlay on exterior */}
        <motion.div style={{ y: textY }} className="absolute bottom-24 text-center z-10">
          <p className="text-slate-300 text-lg font-light tracking-wide">Every home has a story.</p>
          <p className="text-slate-400 text-sm mt-1">Scroll to go inside.</p>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.4 }}
            className="mt-3 flex justify-center"
          >
            <ChevronRight className="rotate-90 text-blue-400 h-5 w-5" />
          </motion.div>
        </motion.div>

        {/* Interior reveal */}
        <motion.div
          style={{ opacity: interiorOpacity, y: interiorY }}
          className="absolute inset-0 flex flex-col items-center justify-center px-6 z-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-3">
            Inspect every corner.<br />
            <span className="text-blue-400">Document everything.</span>
          </h2>
          <p className="text-slate-300 text-center max-w-lg mb-10">
            InspectIQ walks you through every system in the home — powered by InterNACHI standards — then writes the report for you.
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-xl">
            {rooms.map((room) => (
              <div key={room.label} className={`flex flex-col items-center gap-2 p-4 rounded-xl border bg-white/5 border-white/10 backdrop-blur`}>
                <span className="text-3xl">{room.emoji}</span>
                <span className="text-sm text-slate-200 font-medium">{room.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// Dashboard mockup — shows what the product looks like
function DashboardMockup() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
      {/* Browser chrome */}
      <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 mx-4 bg-white rounded px-3 py-1 text-xs text-slate-400 border border-slate-200">
          app.inspectiq.com/dashboard
        </div>
      </div>
      {/* App content */}
      <div className="flex h-80">
        {/* Sidebar */}
        <div className="w-44 bg-white border-r border-slate-100 p-3 flex flex-col gap-1">
          <div className="flex items-center gap-2 px-2 py-2 mb-2">
            <Building2 className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-bold text-slate-900">InspectIQ</span>
          </div>
          {[
            { label: 'Dashboard', active: false },
            { label: 'Inspections', active: true },
            { label: 'Reports', active: false },
            { label: 'Settings', active: false },
          ].map((item) => (
            <div key={item.label} className={`px-2 py-1.5 rounded-lg text-xs font-medium ${item.active ? 'bg-blue-50 text-blue-700' : 'text-slate-500'}`}>
              {item.label}
            </div>
          ))}
        </div>
        {/* Content */}
        <div className="flex-1 p-4 bg-slate-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="h-4 w-32 bg-slate-800 rounded mb-1" />
              <div className="h-2.5 w-24 bg-slate-300 rounded" />
            </div>
            <div className="h-7 w-28 bg-blue-600 rounded-lg" />
          </div>
          <div className="space-y-2">
            {[
              { addr: '142 Maple Grove Drive', status: 'completed', color: 'bg-green-100 text-green-700' },
              { addr: '2847 Fixer Upper Lane', status: 'completed', color: 'bg-green-100 text-green-700' },
              { addr: '918 Victorian Heights', status: 'in_progress', color: 'bg-amber-100 text-amber-700' },
              { addr: '4421 Modern Oaks Ct', status: 'completed', color: 'bg-green-100 text-green-700' },
            ].map((item) => (
              <div key={item.addr} className="bg-white rounded-lg border border-slate-100 px-3 py-2 flex items-center justify-between shadow-sm">
                <div>
                  <div className="text-xs font-medium text-slate-800">{item.addr}</div>
                  <div className="text-xs text-slate-400 mt-0.5">Client · Apr 2026</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.color}`}>
                  {item.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AnimatedLanding() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Nav ── */}
      <nav className="border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <a href="#" className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity">
            <Building2 className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-xl text-slate-900">InspectIQ</span>
          </a>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-600">
            <a href="#" className="hover:text-slate-900 transition-colors">Home</a>
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-slate-900 transition-colors">Reviews</a>
            <Link href="/sample-report" className="hover:text-slate-900 transition-colors font-medium text-blue-600 hover:text-blue-700">Sample Report</Link>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/auth/login"><Button variant="ghost" size="sm" className="hover:bg-slate-100 transition-colors">Log in</Button></Link>
            <Link href="/auth/signup">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm">Start Free Trial</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 pt-16 sm:pt-24 pb-20 sm:pb-32 px-4 sm:px-6 text-center overflow-hidden relative">
        {/* Background stars */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(40)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-0.5 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.6 + 0.1,
              }}
              animate={{ opacity: [0.1, 0.7, 0.1] }}
              transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 3 }}
            />
          ))}
        </div>

        <div className="relative max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Badge variant="secondary" className="mb-6 text-blue-300 bg-blue-950 border-blue-800">
              InterNACHI Standards · AI-Powered
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6"
          >
            Inspection reports<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              that write themselves.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="text-xl text-slate-300 max-w-2xl mx-auto mb-10"
          >
            InspectIQ turns your field notes into professional, branded PDF reports in minutes — powered by AI and pre-loaded with InterNACHI Standards of Practice.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/auth/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-base px-8 shadow-lg shadow-blue-900/30 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-blue-900/40">
                Start your free 14-day trial
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="#features" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 border-2 border-slate-400 text-white bg-white/10 hover:bg-white/20 hover:border-white hover:scale-105 active:scale-95 transition-all duration-200 backdrop-blur-sm">
                See how it works
              </Button>
            </Link>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-sm text-slate-500 mt-4"
          >
            14-day free trial. Cancel anytime. No charge until day 15.
          </motion.p>

          {/* Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="mt-12 sm:mt-16 max-w-3xl mx-auto overflow-hidden"
          >
            <DashboardMockup />
          </motion.div>
        </div>
      </section>

      {/* ── Social proof bar ── */}
      <section className="border-y border-slate-100 bg-slate-50 py-5">
        <FadeInWhenVisible>
          <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-center gap-8 text-sm text-slate-500">
            {[
              'ASHI & InterNACHI standards pre-loaded',
              'Reports delivered to clients in minutes',
              'Mobile-friendly — works in the field',
            ].map((text) => (
              <div key={text} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </FadeInWhenVisible>
      </section>

      {/* ── House Journey (scroll animation) ── */}
      <HouseJourney />

      {/* ── Features ── */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <FadeInWhenVisible>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything a professional inspector needs
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              Built specifically for home inspectors — not a generic tool adapted to fit.
            </p>
          </div>
        </FadeInWhenVisible>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <FadeInWhenVisible key={f.title} delay={i * 0.07}>
              <Card className="border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 h-full">
                <CardContent className="pt-6">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                    <f.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
                </CardContent>
              </Card>
            </FadeInWhenVisible>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="bg-slate-50 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeInWhenVisible>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Inspectors love InspectIQ</h2>
            </div>
          </FadeInWhenVisible>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <FadeInWhenVisible key={t.name} delay={i * 0.1}>
                <Card className="bg-white border-slate-100 shadow-sm h-full">
                  <CardContent className="pt-6">
                    <div className="flex gap-0.5 mb-4">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed mb-6">"{t.body}"</p>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                      <p className="text-slate-400 text-xs">{t.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <FadeInWhenVisible>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-slate-500">One plan. Everything included. Cancel anytime.</p>
          </div>
        </FadeInWhenVisible>
        <FadeInWhenVisible delay={0.1}>
          <div className="max-w-md mx-auto">
            <Card className="border-2 border-blue-600 shadow-2xl shadow-blue-100">
              <CardContent className="pt-8 pb-8">
                <div className="text-center mb-8">
                  <div className="flex items-end justify-center gap-1">
                    <span className="text-5xl font-bold text-slate-900">$99</span>
                    <span className="text-slate-500 mb-2">/month</span>
                  </div>
                  <p className="text-slate-500 text-sm mt-2">Everything included. Cancel anytime.</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {pricingFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                {/* Two CTAs */}
                <div className="space-y-3">
                  <Link href="/auth/signup" className="block">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                      Start 14-day free trial
                    </Button>
                  </Link>
                  <Link href="/auth/signup?checkout=1" className="block">
                    <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50" size="lg">
                      Subscribe now — $99/mo
                    </Button>
                  </Link>
                </div>
                <p className="text-center text-xs text-slate-400 mt-3">Free trial: no credit card required. Subscribe now: billed immediately.</p>
              </CardContent>
            </Card>
          </div>
        </FadeInWhenVisible>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-20">
        <FadeInWhenVisible>
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to write better reports faster?
            </h2>
            <p className="text-blue-100 text-lg mb-8">
              Join inspectors who have cut their report time in half.
            </p>
            <Link href="/auth/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 hover:scale-105 active:scale-95 transition-all duration-200 text-base px-8 shadow-lg">
                Start your free 14-day trial
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </FadeInWhenVisible>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-100 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-600" />
            <span className="font-semibold text-slate-700">InspectIQ</span>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-slate-600 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-600 transition-colors">Terms</Link>
            <a href="mailto:support@useinspectiq.com" className="hover:text-slate-600 transition-colors">Support</a>
          </div>
          <p>© {new Date().getFullYear()} InspectIQ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
