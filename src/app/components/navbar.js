'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { User, ChevronDown, Bot } from 'lucide-react'

export default function Navbar({ activePage }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

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

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleSignOut() {
    const confirmed = window.confirm('Are you sure you want to sign out?')
    if (!confirmed) return
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between w-full relative">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-blue-600 shrink-0">
          FinAid SG
        </Link>

        {/* Main navbar links - centered */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
          {[
            { label: 'Browse', href: '/browse', key: 'browse' },
            { label: 'Quiz', href: '/quiz', key: 'quiz' },
            { label: 'Compare', href: '/compare', key: 'compare' },
            { label: 'Institutions', href: '/institutions', key: 'institutions' },
          ].map(({ label, href, key }) => (
            <Link
              key={key}
              href={href}
              className={`px-3 py-2 rounded-lg text-sm transition ${
                activePage === key
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* AI Assistant button */}
          <Link
            href="/chat"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
              activePage === 'chat'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
          >
            <Bot className="w-4 h-4" />
            AI Assistant
          </Link>

          {/* User menu */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition"
              >
                <div className="bg-blue-600 rounded-full p-1">
                  <User className="w-3 h-3 text-white" />
                </div>
                <ChevronDown className="w-3 h-3" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  <div className="py-1">
                    {[
                      { label: 'Dashboard', href: '/dashboard' },
                      { label: 'Alerts', href: '/alerts' },
                      { label: 'Institution Portal', href: '/institutions/dashboard' },
                      { label: 'About', href: '/about' },
                    ].map(({ label, href }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        {label}
                      </Link>
                    ))}
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}