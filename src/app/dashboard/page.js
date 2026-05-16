'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Bookmark, LogOut, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Navbar from '@/app/components/navbar'

export default function DashboardPage() {
    const router = useRouter()
    const [user, setUser] = useState(null)
    const [savedSchemes, setSavedSchemes] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login')
                return
            }

            setUser(user)

            const { data } = await supabase
                .from('saved_schemes')
                .select('*, schemes(*, categories(name))')
                .eq('user_id', user.id)
                .order('saved_at', { ascending: false })

            setSavedSchemes(data || [])
            setLoading(false)
        }
        load()
    }, [])

    async function handleSignOut() {
        await supabase.auth.signOut()
        router.push('/')
    }

    async function unsaveScheme(schemeId) {
        const confirmed = window.confirm('Remove this scheme from your saved list?')
        if (!confirmed) return
        await supabase
            .from('saved_schemes')
            .delete()
            .eq('user_id', user.id)
            .eq('scheme_id', schemeId)
        setSavedSchemes(prev => prev.filter(s => s.scheme_id !== schemeId))
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
            {/* Navbar */}
            <Navbar activePage="home" />

            <div className="max-w-4xl mx-auto px-6 py-10">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="bg-blue-600 rounded-full p-3">
                        <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
                        <p className="text-gray-500 text-sm">{user?.email}</p>
                    </div>
                </div>

                {/* Saved Schemes */}
                <div className="bg-white border border-gray-200 rounded-2xl p-8">
                    <div className="flex items-center gap-2 mb-6">
                        <Bookmark className="w-5 h-5 text-blue-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Saved Schemes</h2>
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full ml-1">
                            {savedSchemes.length}
                        </span>
                    </div>

                    {savedSchemes.length === 0 ? (
                        <div className="text-center py-12">
                            <Bookmark className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                            <p className="text-gray-500 mb-4">No saved schemes yet</p>
                            <Link
                                href="/browse"
                                className="text-blue-600 text-sm hover:underline"
                            >
                                Browse schemes to save them →
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {savedSchemes.map((saved) => (
                                <div
                                    key={saved.id}
                                    className="border border-gray-200 rounded-xl p-5 flex items-start justify-between gap-4"
                                >
                                    <div className="flex-1">
                                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                            {saved.schemes?.categories?.name}
                                        </span>
                                        <h3 className="font-semibold text-gray-900 mt-2 mb-1">
                                            {saved.schemes?.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 line-clamp-2">
                                            {saved.schemes?.description}
                                        </p>
                                        <p className="text-sm font-medium text-green-600 mt-2">
                                            {saved.schemes?.amount}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-2 shrink-0">
                                        <Link
                                            href={`/schemes/${saved.schemes?.slug}`}
                                            className="text-xs text-blue-600 hover:underline text-right"
                                        >
                                            View details →
                                        </Link>
                                        <button
                                            onClick={() => unsaveScheme(saved.scheme_id)}
                                            className="text-xs text-red-400 hover:text-red-600"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}