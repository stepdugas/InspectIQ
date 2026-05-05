'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Mail, Building2, HelpCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const faqs = [
  {
    question: 'How do I get started with InspectIQ?',
    answer:
      'After signing up and starting your free trial, you can create your first inspection from the dashboard. Add property details, walk through each room or system, log your findings, annotate photos, and generate a professional PDF report — all from one place.',
  },
  {
    question: 'How does the AI narrative generation work?',
    answer:
      'When you log a finding for any inspection item, InspectIQ uses AI to generate a clear, professional narrative based on your notes and selected condition. You can edit the generated text before including it in your report. The AI saves you time while keeping you in full control of the final language.',
  },
  {
    question: 'How do I annotate photos?',
    answer:
      'After uploading a photo to a finding, tap or click the annotation tool to draw arrows, circles, or text directly on the image. Annotations help highlight defects and make your reports easier for clients to understand.',
  },
  {
    question: 'How do I collect payment from clients?',
    answer:
      'InspectIQ integrates with Stripe so you can send payment links or collect payment at the time of booking. You can set your fee per-inspection in the inspection editor, and clients pay securely online.',
  },
  {
    question: 'Can I use InspectIQ offline or in low-signal areas?',
    answer:
      'InspectIQ is a web-based platform that requires an internet connection. We recommend having a stable connection when generating AI narratives and exporting reports. For on-site inspections with limited signal, you can view cached inspections, but creating new content requires connectivity.',
  },
  {
    question: 'How do I create custom inspection templates?',
    answer:
      'Go to the Templates page (in the sidebar) from your dashboard. You can create templates with custom sections, items, and default narratives tailored to your inspection style. Templates save time on repeat inspection types like residential, commercial, or pre-listing.',
  },
  {
    question: 'How do I connect my ISN account?',
    answer:
      'Go to the Settings page and scroll to the ISN Integration section. Enter your ISN API credentials to sync scheduled inspections, client info, and agent details directly into InspectIQ.',
  },
  {
    question: 'How do I add my signature to reports?',
    answer:
      'Go to Settings > Profile and upload your signature image, or use the built-in signature pad to draw one. Your signature will automatically appear on the summary page of every exported report.',
  },
  {
    question: 'What happens after my free trial ends?',
    answer:
      'Your 14-day free trial gives you full access to all features. When it ends, your account will be paused until you subscribe. Your data is saved — you will not lose any inspections or reports. Simply choose a plan to pick up right where you left off.',
  },
  {
    question: 'How do I cancel my subscription?',
    answer:
      'You can cancel anytime from Settings > Billing. Your access continues through the end of your current billing period. No partial-month refunds are issued, but you will not be charged again after cancellation.',
  },
]

export default function SupportPage() {
  const [openIndices, setOpenIndices] = useState<number[]>([])

  function toggle(index: number) {
    setOpenIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            <span className="font-bold text-slate-900">InspectIQ</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <HelpCircle className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-3">
            Support Center
          </h1>
          <p className="text-slate-500 text-lg">
            Find answers to common questions or reach out to our team.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-slate-200">
                <button
                  onClick={() => toggle(index)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="font-medium text-slate-900 pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      openIndices.includes(index) ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openIndices.includes(index) && (
                  <CardContent className="px-6 pb-4 pt-0">
                    <p className="text-slate-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <Card className="border-slate-200">
          <CardContent className="p-8 text-center">
            <Mail className="h-8 w-8 text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Still need help?
            </h2>
            <p className="text-slate-500 mb-4">
              Our support team is here for you.
            </p>
            <a
              href="mailto:support@useinspectiq.com"
              className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
            >
              support@useinspectiq.com
            </a>
            <p className="text-sm text-slate-400 mt-3">
              We typically respond within 24 hours.
            </p>
          </CardContent>
        </Card>

        {/* Back to main site */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="text-sm text-slate-500 hover:text-blue-600 transition-colors"
          >
            &larr; Back to InspectIQ
          </Link>
        </div>
      </div>
    </div>
  )
}
