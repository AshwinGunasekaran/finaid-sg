'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Bookmark, BookmarkCheck } from 'lucide-react'

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
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition ${
        saved
          ? 'bg-blue-600 text-white border-blue-600'
          : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
      }`}
    >
      {saved ? (
        <>
          <BookmarkCheck className="w-4 h-4" />
          Saved
        </>
      ) : (
        <>
          <Bookmark className="w-4 h-4" />
          Save Scheme
        </>
      )}
    </button>
  )
}