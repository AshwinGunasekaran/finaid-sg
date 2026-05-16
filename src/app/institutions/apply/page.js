'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/app/components/navbar'
import { useRouter } from 'next/navigation'
import { Building, CheckCircle } from 'lucide-react'

export default function InstitutionApplyPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    website: '',
    contact_email: ''
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value,
      // Auto-generate slug from name
      ...(name === 'name' ? {
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      } : {})
    }))
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    // Create institution
    const { data: institution, error: instError } = await supabase
      .from('institutions')
      .insert({
        name: form.name,
        slug: form.slug,
        description: form.description,
        website: form.website,
        contact_email: form.contact_email,
        status: 'pending'
      })
      .select()
      .single()

    if (instError) {
      setError(instError.message)
      setLoading(false)
      return
    }

    // Link user to institution
    await supabase
      .from('institution_users')
      .insert({
        institution_id: institution.id,
        user_id: user.id,
        role: 'admin'
      })

    setSubmitted(true)
    setLoading(false)
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar activePage="" />
        <div className="max-w-lg mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center justify-center bg-green-100 rounded-full p-4 mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Application Submitted!</h1>
          <p className="text-gray-500 mb-6">
            Thanks for applying to list your institution on FinAid SG. We'll review your application and get back to you within 2-3 business days.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-full font-medium hover:bg-blue-700 transition"
          >
            Back to Homepage
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar activePage="" />

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-2">
          <Building className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">List Your Institution</h1>
        </div>
        <p className="text-gray-500 mb-8">
          Apply to list your bank, insurance company or government agency on FinAid SG. Once approved, you can manage your own schemes directly.
        </p>

        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          {/* Institution Name */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Institution Name *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. DBS Bank Singapore"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition"
            />
          </div>

          {/* Slug */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL Slug *
            </label>
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
              <span className="px-4 py-3 text-sm text-gray-400 border-r border-gray-200">
                finaidsg.com/institutions/
              </span>
              <input
                type="text"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="dbs-bank"
                className="flex-1 bg-transparent px-4 py-3 text-sm outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Brief description of your institution and the types of schemes you offer..."
              rows={3}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition resize-none"
            />
          </div>

          {/* Website */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              type="url"
              name="website"
              value={form.website}
              onChange={handleChange}
              placeholder="https://www.dbs.com.sg"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition"
            />
          </div>

          {/* Contact Email */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Email *
            </label>
            <input
              type="email"
              name="contact_email"
              value={form.contact_email}
              onChange={handleChange}
              placeholder="partnerships@yourbank.com"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm bg-red-50 text-red-700">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !form.name || !form.description || !form.contact_email}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </div>
    </main>
  )
}