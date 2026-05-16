'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/app/components/navbar'
import { useRouter } from 'next/navigation'
import { Bell, BellOff } from 'lucide-react'

export default function AlertsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [categories, setCategories] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const { data: cats } = await supabase.from('categories').select('*')
      setCategories(cats || [])

      const { data: existingAlerts } = await supabase
        .from('alerts')
        .select('*')
        .eq('user_id', user.id)
      setAlerts(existingAlerts || [])

      setLoading(false)
    }
    load()
  }, [])

  function isSubscribed(categoryId) {
    return alerts.some(a => a.category_id === categoryId)
  }

  async function toggleAlert(categoryId) {
    if (!user) return
    setSaving(true)

    if (isSubscribed(categoryId)) {
      await supabase
        .from('alerts')
        .delete()
        .eq('user_id', user.id)
        .eq('category_id', categoryId)
      setAlerts(prev => prev.filter(a => a.category_id !== categoryId))
      setMessage('Alert removed!')
    } else {
      const { data } = await supabase
        .from('alerts')
        .insert({ user_id: user.id, category_id: categoryId, email: user.email })
        .select()
        .single()
      setAlerts(prev => [...prev, data])
      setMessage('Alert enabled!')
    }

    setSaving(false)
    setTimeout(() => setMessage(null), 2000)
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
      <Navbar activePage="alerts" />

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-2">
          <Bell className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Email Alerts</h1>
        </div>
        <p className="text-gray-500 mb-8">
          Get notified at <strong>{user?.email}</strong> when new schemes are added in categories you care about.
        </p>

        {/* Success message */}
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm mb-6">
            {message}
          </div>
        )}

        {/* Categories */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {categories.map((cat, i) => (
            <div
              key={cat.id}
              className={`flex items-center justify-between px-6 py-4 ${
                i !== categories.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div>
                <p className="font-medium text-gray-900">{cat.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{cat.description}</p>
              </div>
              <button
                onClick={() => toggleAlert(cat.id)}
                disabled={saving}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition ${
                  isSubscribed(cat.id)
                    ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
                }`}
              >
                {isSubscribed(cat.id) ? (
                  <><Bell className="w-4 h-4" /> Subscribed</>
                ) : (
                  <><BellOff className="w-4 h-4" /> Subscribe</>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}