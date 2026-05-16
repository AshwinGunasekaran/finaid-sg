'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/app/components/navbar'
import { useRouter } from 'next/navigation'

export default function NewSchemePage() {
  const router = useRouter()
  const [institution, setInstitution] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    title: '',
    slug: '',
    category_id: '',
    description: '',
    amount: '',
    how_it_works: '',
    apply_url: '',
    source_url: '',
  })

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

      const { data: cats } = await supabase.from('categories').select('*')
      setCategories(cats || [])
      setLoading(false)
    }
    load()
  }, [])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'title' ? {
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      } : {})
    }))
  }

  async function handleSubmit() {
    setSaving(true)
    setError(null)

    const { error } = await supabase
      .from('schemes')
      .insert({
        title: form.title,
        slug: form.slug,
        category_id: parseInt(form.category_id),
        provider: institution.name,
        description: form.description,
        amount: form.amount,
        how_it_works: form.how_it_works,
        apply_url: form.apply_url,
        source_url: form.source_url,
        is_active: true
      })

    if (error) {
      setError(error.message)
      setSaving(false)
      return
    }

    router.push('/institutions/dashboard')
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar activePage="" />

      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Add New Scheme</h1>
        <p className="text-gray-500 mb-8">
          Adding scheme for <strong>{institution?.name}</strong>
        </p>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Scheme Title *</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. DBS Study Loan 2026"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug *</label>
            <input
              type="text"
              name="slug"
              value={form.slug}
              onChange={handleChange}
              placeholder="dbs-study-loan-2026"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition"
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe what this scheme is and who it's for..."
              rows={3}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition resize-none"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount / Coverage</label>
            <input
              type="text"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="e.g. Up to $150,000"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition"
            />
          </div>

          {/* How it works */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">How It Works</label>
            <textarea
              name="how_it_works"
              value={form.how_it_works}
              onChange={handleChange}
              placeholder="Explain how the scheme works and how to apply..."
              rows={3}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition resize-none"
            />
          </div>

          {/* Apply URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Application URL</label>
            <input
              type="url"
              name="apply_url"
              value={form.apply_url}
              onChange={handleChange}
              placeholder="https://www.dbs.com.sg/apply"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition"
            />
          </div>

          {/* Source URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source URL</label>
            <input
              type="url"
              name="source_url"
              value={form.source_url}
              onChange={handleChange}
              placeholder="https://www.dbs.com.sg/study-loan"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-hidden focus:border-blue-400 transition"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl text-sm bg-red-50 text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => router.push('/institutions/dashboard')}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || !form.title || !form.description || !form.category_id}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Publishing...' : 'Publish Scheme'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}