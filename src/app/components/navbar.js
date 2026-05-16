'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { User, LogOut } from 'lucide-react'

export default function Navbar({ activePage }) {
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    const confirmed = window.confirm('Are you sure you want to sign out?')
    if (!confirmed) return
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-600">
          FinAid SG
        </Link>
        <div className="flex gap-6 text-sm text-gray-600 items-center">
          <Link href="/browse" className={activePage === 'browse' ? 'text-blue-600 font-medium' : 'hover:text-blue-600'}>
            Browse
          </Link>
          <Link href="/chat" className={activePage === 'chat' ? 'text-blue-600 font-medium' : 'hover:text-blue-600'}>
            AI Assistant
          </Link>
          <Link href="/about" className={activePage === 'about' ? 'text-blue-600 font-medium' : 'hover:text-blue-600'}>
            About
          </Link>
          {user ? (
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className={`flex items-center gap-1 ${activePage === 'dashboard' ? 'text-blue-600 font-medium' : 'hover:text-blue-600'}`}
              >
                <User className="w-4 h-4" />
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1 text-red-500 hover:text-red-600"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}