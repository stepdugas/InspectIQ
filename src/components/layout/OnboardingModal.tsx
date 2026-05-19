'use client'

/**
 * OnboardingModal — shown once to new inspectors on their first dashboard visit.
 * Walks through: Welcome → Profile setup → First inspection.
 * Completion tracked in localStorage so it never shows again after dismissal.
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Building2, Zap, FileText, CheckCircle2,
  ArrowRight, UserCog, ClipboardList, X, Bot,
} from 'lucide-react'

const STORAGE_KEY = 'inspectiq_onboarding_v2'

const STEPS = [
  {
    icon: Building2,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    title: 'Welcome to InspectIQ!',
    subtitle: "You just hired 13 AI employees. Let's see them work — it takes 60 seconds.",
    bullets: [
      { icon: Zap, text: 'AI writes your reports, delivers them, follows up, and requests reviews' },
      { icon: Bot, text: 'Toggle each agent on or off — you are always in control' },
      { icon: CheckCircle2, text: 'InterNACHI + TREC templates pre-loaded' },
    ],
    primaryLabel: 'See the AI in action',
    secondaryLabel: 'Skip tour',
  },
  {
    icon: ClipboardList,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    title: 'Try the AI Report Writer',
    subtitle: 'Create an inspection, type a quick note on any room (even just "roof looks good"), then hit "Generate AI." Watch it write a professional narrative in seconds.',
    bullets: [
      { icon: Zap, text: 'Type a quick note → AI turns it into a full narrative' },
      { icon: CheckCircle2, text: 'Works with any template — just add your notes' },
      { icon: Bot, text: 'Mark complete → Delivery, Follow-Up, and Review agents activate' },
    ],
    primaryLabel: 'Create first inspection',
    secondaryLabel: 'I\'ll do this later',
  },
  {
    icon: UserCog,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    title: 'Finish your setup',
    subtitle: 'Add your name and company so reports look professional. Connect Google to unlock email agents.',
    bullets: [
      { icon: CheckCircle2, text: 'Add your company name and license number' },
      { icon: CheckCircle2, text: 'Connect Google for email + calendar sync' },
      { icon: CheckCircle2, text: 'Upload your logo (optional — you can do this anytime)' },
    ],
    primaryLabel: 'Go to Settings',
    secondaryLabel: 'Explore dashboard',
  },
]

export default function OnboardingModal() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Only show if never completed
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true)
    }
  }, [])

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  function handlePrimary() {
    if (step === 0) {
      setStep(1) // Welcome → Try AI
    } else if (step === 1) {
      dismiss()
      router.push('/dashboard/inspections/new') // Try AI → Create inspection
    } else {
      dismiss()
      router.push('/dashboard/settings') // Finish setup → Settings
    }
  }

  function handleSecondary() {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      dismiss()
    }
  }

  const current = STEPS[step]
  const Icon = current.icon

  if (!visible) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.97 }}
          transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative"
        >
          {/* Close */}
          <button
            onClick={dismiss}
            className="absolute top-4 right-4 text-slate-300 hover:text-slate-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Step dots */}
          <div className="flex items-center gap-1.5 mb-6">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? 'w-6 bg-blue-600' : i < step ? 'w-3 bg-blue-300' : 'w-3 bg-slate-200'
                }`}
              />
            ))}
          </div>

          {/* Icon */}
          <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${current.iconBg} mb-5`}>
            <Icon className={`h-7 w-7 ${current.iconColor}`} />
          </div>

          {/* Text */}
          <h2 className="text-xl font-bold text-slate-900 mb-2">{current.title}</h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">{current.subtitle}</p>

          {/* Bullets */}
          <ul className="space-y-3 mb-8">
            {current.bullets.map((b, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-slate-700">
                <b.icon className="h-4 w-4 text-blue-500 shrink-0" />
                {b.text}
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={handlePrimary}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {current.primaryLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <button
              onClick={handleSecondary}
              className="text-sm text-slate-400 hover:text-slate-600 py-1 transition-colors"
            >
              {current.secondaryLabel}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
