'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/app/components/navbar'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Building, Plus, Edit, Eye } from 'lucide-react'

export default function InstitutionDashboard() {
    const router = useRouter()
    const [institution, setInstitution] = useState(null)
    const [schemes, setSchemes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [analytics, setAnalytics] = useState({ totalViews: 0, totalClicks: 0, raw: [] })

    useEffect(() => {
        async function load() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/login'); return }

            const { data: membership, error: membershipError } = await supabase
                .from('institution_users')
                .select('*, institutions(*)')
                .eq('user_id', user.id)
                .single()

            console.log('User ID:', user.id)
            console.log('Membership:', membership)
            console.log('Membership error:', membershipError)

            if (!membership) {
                setError('You are not linked to any institution. Apply to list your institution first.')
                setLoading(false)
                return
            }

            if (membership.institutions.status !== 'approved') {
                setError('Your institution application is still pending approval. We will notify you once approved.')
                setLoading(false)
                return
            }

            setInstitution(membership.institutions)

            // Get schemes for this institution
            const { data: schemes } = await supabase
                .from('schemes')
                .select('*, categories(name)')
                .eq('provider', membership.institutions.name)
                .order('created_at', { ascending: false })

            setSchemes(schemes || [])

            // Get analytics for all schemes
            const schemeIds = schemes?.map(s => s.id) || []
            let analytics = []

            if (schemeIds.length > 0) {
                const { data: analyticsData } = await supabase
                    .from('scheme_analytics')
                    .select('*')
                    .in('scheme_id', schemeIds)
                analytics = analyticsData || []
            }

            // Calculate totals
            const totalViews = analytics.filter(a => a.event_type === 'view').length
            const totalClicks = analytics.filter(a => a.event_type === 'click').length

            setAnalytics({ totalViews, totalClicks, raw: analytics })

            setLoading(false)
        }
        load()
    }, [])

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-400">Loading...</div>
            </main>
        )
    }

    if (error) {
        return (
            <main className="min-h-screen bg-gray-50">
                <Navbar activePage="" />
                <div className="max-w-2xl mx-auto px-6 py-20 text-center">
                    <Building className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link
                        href="/institutions/apply"
                        className="bg-blue-600 text-white px-6 py-3 rounded-full font-medium hover:bg-blue-700 transition"
                    >
                        Apply to List Your Institution
                    </Link>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <Navbar activePage="" />

            <div className="max-w-5xl mx-auto px-6 py-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{institution.name}</h1>
                        <p className="text-gray-500 text-sm mt-1">Institution Dashboard</p>
                    </div>
                    <Link
                        href="/institutions/schemes/new"
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-blue-700 transition"
                    >
                        <Plus className="w-4 h-4" />
                        Add New Scheme
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                        <p className="text-sm text-gray-500 mb-1">Total Schemes</p>
                        <p className="text-3xl font-bold text-gray-900">{schemes.length}</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                        <p className="text-sm text-gray-500 mb-1">Active Schemes</p>
                        <p className="text-3xl font-bold text-green-600">
                            {schemes.filter(s => s.is_active).length}
                        </p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                        <p className="text-sm text-gray-500 mb-1">Total Views</p>
                        <p className="text-3xl font-bold text-blue-600">{analytics.totalViews}</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                        <p className="text-sm text-gray-500 mb-1">Total Clicks</p>
                        <p className="text-3xl font-bold text-purple-600">{analytics.totalClicks}</p>
                    </div>
                </div>

                {/* Schemes list */}
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="font-semibold text-gray-900">Your Schemes</h2>
                    </div>

                    {schemes.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-gray-400 mb-4">No schemes listed yet</p>
                            <Link
                                href="/institutions/schemes/new"
                                className="text-blue-600 text-sm hover:underline"
                            >
                                Add your first scheme →
                            </Link>
                        </div>
                    ) : (
                        <div>
                            {schemes.map((scheme, i) => (
                                <div
                                    key={scheme.id}
                                    className={`px-6 py-4 flex items-center justify-between gap-4 ${i !== schemes.length - 1 ? 'border-b border-gray-100' : ''
                                        }`}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                                {scheme.categories?.name}
                                            </span>
                                            {!scheme.is_active && (
                                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                                    Inactive
                                                </span>
                                            )}
                                        </div>
                                        <p className="font-medium text-gray-900">{scheme.title}</p>
                                        <p className="text-sm text-green-600">{scheme.amount}</p>
                                        <div className="flex gap-3 mt-1">
                                            <span className="text-xs text-gray-400">
                                                👁 {analytics.raw.filter(a => a.scheme_id === scheme.id && a.event_type === 'view').length} views
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                🖱 {analytics.raw.filter(a => a.scheme_id === scheme.id && a.event_type === 'click').length} clicks
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Link
                                            href={`/schemes/${scheme.slug}`}
                                            className="text-gray-400 hover:text-blue-600 transition"
                                            title="View public page"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Link>
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