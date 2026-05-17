'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/app/components/navbar'
import { useRouter } from 'next/navigation'
import { Star, Check } from 'lucide-react'

export default function BillingPage() {
  const router = useRouter()
  const [institution, setInstitution] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: membership } = await supabase
        .from('institution_users')
        .select('*, institutions(*)')
        .eq('user_id', user.id)
        .single()

      if (!membership || membership.institutions.status !== 'approved') {
        router.push('/institutions/dashboard')
        return
      }

      setInstitution(membership.institutions)
      setLoading(false)
    }
    load()
  }, [])

  async function handleCheckout(plan) {
    setCheckingOut(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ institutionId: institution.id, plan })
      })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Checkout error:', error)
    }
    setCheckingOut(false)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </main>
    )
  }

  const isFeatured = institution?.subscription_status === 'featured'

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar activePage="" />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Billing & Plans</h1>
        <p className="text-gray-500 mb-8">
          Upgrade to feature your schemes at the top of FinAid SG search results
        </p>

        {/* Current status */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
          <p className="text-sm text-gray-500 mb-1">Current Plan</p>
          <div className="flex items-center gap-2">
            {isFeatured ? (
              <>
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <p className="font-semibold text-gray-900">Featured</p>
              </>
            ) : (
              <p className="font-semibold text-gray-900">Free</p>
            )}
          </div>
        </div>

        {isFeatured ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
            <Star className="w-10 h-10 text-yellow-500 fill-yellow-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">You're on the Featured Plan!</h2>
            <p className="text-gray-500">Your schemes are featured at the top of search results.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Monthly plan */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Monthly</h2>
              <p className="text-3xl font-bold text-gray-900 mb-1">$99 <span className="text-base font-normal text-gray-500">SGD/mo</span></p>
              <p className="text-gray-500 text-sm mb-6">Billed monthly, cancel anytime</p>
              <ul className="space-y-3 mb-8">
                {[
                  'Schemes featured at top of search',
                  'Featured badge on all schemes',
                  'Priority placement in categories',
                  'Analytics dashboard access',
                ].map(feature => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleCheckout('featured_monthly')}
                disabled={checkingOut}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {checkingOut ? 'Redirecting...' : 'Get Started'}
              </button>
            </div>

            {/* Yearly plan */}
            <div className="bg-blue-600 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                SAVE 16%
              </div>
              <h2 className="text-lg font-bold mb-1">Yearly</h2>
              <p className="text-3xl font-bold mb-1">$999 <span className="text-base font-normal opacity-75">SGD/yr</span></p>
              <p className="opacity-75 text-sm mb-6">Billed annually</p>
              <ul className="space-y-3 mb-8">
                {[
                  'Everything in Monthly',
                  '2 months free',
                  'Priority support',
                  'Early access to new features',
                ].map(feature => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleCheckout('featured_yearly')}
                disabled={checkingOut}
                className="w-full bg-white text-blue-600 py-3 rounded-xl font-medium hover:bg-blue-50 transition disabled:opacity-50"
              >
                {checkingOut ? 'Redirecting...' : 'Get Started'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}