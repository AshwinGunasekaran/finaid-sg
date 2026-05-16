'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Bookmark } from 'lucide-react'

export default function SaveButton({ schemeId }) {
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data } = await supabase
          .from('saved_schemes')
          .select('id')
          .eq('user_id', user.id)
          .eq('scheme_id', schemeId)
          .single()
        setSaved(!!data)
      }
      setLoading(false)
    }
    check()
  }, [schemeId])

  async function toggleSave() {
    if (!user) {
      window.location.href = '/login'
      return
    }

    setLoading(true)
    if (saved) {
      await supabase
        .from('saved_schemes')
        .delete()
        .eq('user_id', user.id)
        .eq('scheme_id', schemeId)
      setSaved(false)
    } else {
      await supabase
        .from('saved_schemes')
        .insert({ user_id: user.id, scheme_id: schemeId })
      setSaved(true)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={toggleSave}
      disabled={loading}
      title={saved ? 'Remove from saved' : 'Save scheme'}
      className={`p-2 rounded-full transition ${
        saved
          ? 'text-blue-600 hover:text-blue-700'
          : 'text-gray-300 hover:text-gray-400'
      } disabled:opacity-50`}
    >
      <Bookmark className={`w-6 h-6 ${saved ? 'fill-blue-600' : ''}`} />
    </button>
  )
}