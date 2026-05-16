'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/app/components/navbar'
import { ChevronRight, ChevronLeft } from 'lucide-react'

const steps = [
  {
    id: 1,
    question: "What's your citizenship status?",
    field: 'citizenship',
    options: [
      { label: 'Singapore Citizen', value: 'citizen' },
      { label: 'Permanent Resident (PR)', value: 'pr' },
      { label: 'Foreigner / Work Pass Holder', value: 'foreigner' },
    ]
  },
  {
    id: 2,
    question: "What's your age group?",
    field: 'age',
    options: [
      { label: 'Under 21', value: 'under21' },
      { label: '21 - 30', value: '21to30' },
      { label: '31 - 40', value: '31to40' },
      { label: '41 - 55', value: '41to55' },
      { label: '55 and above', value: 'above55' },
    ]
  },
  {
    id: 3,
    question: "What's your monthly household income?",
    field: 'income',
    options: [
      { label: 'Less than $1,500', value: 'below1500' },
      { label: '$1,500 - $3,000', value: '1500to3000' },
      { label: '$3,000 - $6,000', value: '3000to6000' },
      { label: '$6,000 - $10,000', value: '6000to10000' },
      { label: 'Above $10,000', value: 'above10000' },
    ]
  },
  {
    id: 4,
    question: 'What do you need help with?',
    field: 'need',
    options: [
      { label: '🎓 Scholarships or Bursaries', value: 'scholarships' },
      { label: '📚 Student or Education Loans', value: 'student-loans' },
      { label: '🏠 Housing Loans', value: 'housing-loans' },
      { label: '🚗 Car Loans', value: 'car-loans' },
      { label: '💳 Personal Loans', value: 'personal-loans' },
      { label: '🛡️ Insurance', value: 'insurance' },
      { label: '💰 Government Financial Assistance', value: 'financial-assistance' },
      { label: '🏢 Business Loans', value: 'business-loans' },
    ]
  },
  {
    id: 5,
    question: 'Are you currently studying?',
    field: 'studying',
    options: [
      { label: 'Yes, full-time student', value: 'fulltime' },
      { label: 'Yes, part-time student', value: 'parttime' },
      { label: 'No, currently working', value: 'working' },
      { label: 'Not studying or working', value: 'neither' },
    ]
  }
]

export default function QuizPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)

  function selectOption(field, value) {
    setAnswers(prev => ({ ...prev, [field]: value }))
  }

  function nextStep() {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      submitQuiz()
    }
  }

  function prevStep() {
    if (currentStep > 0) setCurrentStep(prev => prev - 1)
  }

  function submitQuiz() {
    setLoading(true)
    const params = new URLSearchParams()
    Object.entries(answers).forEach(([key, value]) => params.set(key, value))
    router.push(`/quiz/results?${params.toString()}`)
  }

  const step = steps[currentStep]
  const selected = answers[step.field]
  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar activePage="" />

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Find Your Matching Schemes
          </h1>
          <p className="text-gray-500 text-sm">
            Answer a few quick questions and we'll show you what you're eligible for
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            {step.question}
          </h2>
          <div className="grid gap-3">
            {step.options.map((option) => (
              <button
                key={option.value}
                onClick={() => selectOption(step.field, option.value)}
                className={`text-left px-5 py-4 rounded-xl border text-sm font-medium transition ${
                  selected === option.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-blue-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium border border-gray-200 text-gray-600 hover:border-blue-300 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={nextStep}
            disabled={!selected || loading}
            className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {currentStep === steps.length - 1 ? 'See My Matches' : 'Next'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </main>
  )
}