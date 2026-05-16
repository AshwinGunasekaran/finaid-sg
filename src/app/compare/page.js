'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/app/components/navbar'
import Link from 'next/link'
import { X, Plus, ExternalLink } from 'lucide-react'

export default function ComparePage() {
    const [schemes, setSchemes] = useState([])
    const [selected, setSelected] = useState([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            const { data } = await supabase
                .from('schemes')
                .select('*, categories(name)')
                .eq('is_active', true)
                .order('title')
            setSchemes(data || [])

            // Pre-load scheme from URL param
            const params = new URLSearchParams(window.location.search)
            const preloadSlug = params.get('scheme')
            if (preloadSlug && data) {
                const preloaded = data.find(s => s.slug === preloadSlug)
                if (preloaded) setSelected([preloaded])
            }

            setLoading(false)
        }
        load()
    }, [])

    function addScheme(scheme) {
        if (selected.length >= 3) return
        if (selected.find(s => s.id === scheme.id)) return
        setSelected(prev => [...prev, scheme])
        setSearch('')
    }

    function removeScheme(id) {
        setSelected(prev => prev.filter(s => s.id !== id))
    }

    const filtered = schemes.filter(s =>
        s.title.toLowerCase().includes(search.toLowerCase()) &&
        !selected.find(sel => sel.id === s.id)
    )

    const fields = [
        { label: 'Category', key: 'categories', render: s => s.categories?.name },
        { label: 'Provider', key: 'provider', render: s => s.provider },
        { label: 'Amount / Coverage', key: 'amount', render: s => s.amount },
        { label: 'How It Works', key: 'how_it_works', render: s => s.how_it_works },
        {
            label: 'Apply', key: 'apply_url', render: s => s.apply_url ? (
                <a
                    href={s.apply_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
                >
                    Apply Now <ExternalLink className="w-3 h-3" />
                </a>
            ) : 'N/A'
        },
    ]

    return (
        <main className="min-h-screen bg-gray-50">
            <Navbar activePage="compare" />

            <div className="max-w-6xl mx-auto px-6 py-10">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Compare Schemes</h1>
                <p className="text-gray-500 mb-8">Select up to 3 schemes to compare side by side</p>

                {/* Search to add schemes */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
                    <p className="text-sm font-medium text-gray-700 mb-3">
                        Add a scheme to compare ({selected.length}/3)
                    </p>
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search for a scheme to add..."
                        disabled={selected.length >= 3}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition disabled:opacity-50"
                    />

                    {/* Dropdown results */}
                    {search && (
                        <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden">
                            {filtered.slice(0, 5).map(scheme => (
                                <button
                                    key={scheme.id}
                                    onClick={() => addScheme(scheme)}
                                    className="w-full text-left px-4 py-3 text-sm hover:bg-blue-50 border-b border-gray-100 last:border-0 flex items-center justify-between"
                                >
                                    <div>
                                        <span className="font-medium text-gray-900">{scheme.title}</span>
                                        <span className="text-gray-400 ml-2 text-xs">{scheme.categories?.name}</span>
                                    </div>
                                    <Plus className="w-4 h-4 text-blue-600" />
                                </button>
                            ))}
                            {filtered.length === 0 && (
                                <div className="px-4 py-3 text-sm text-gray-400">No schemes found</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Empty state */}
                {selected.length === 0 && (
                    <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                        <p className="text-gray-400 mb-2">No schemes selected yet</p>
                        <p className="text-gray-400 text-sm">Search for schemes above to start comparing</p>
                    </div>
                )}

                {/* Comparison table */}
                {selected.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                        {/* Scheme headers */}
                        <div className={`grid border-b border-gray-200`} style={{ gridTemplateColumns: `200px repeat(${selected.length}, 1fr)` }}>
                            <div className="p-4 bg-gray-50" />
                            {selected.map(scheme => (
                                <div key={scheme.id} className="p-4 border-l border-gray-200">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                                {scheme.categories?.name}
                                            </span>
                                            <h3 className="font-semibold text-gray-900 mt-2 text-sm leading-tight">
                                                {scheme.title}
                                            </h3>
                                        </div>
                                        <button
                                            onClick={() => removeScheme(scheme.id)}
                                            className="text-gray-300 hover:text-red-400 transition shrink-0"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Comparison rows */}
                        {fields.map((field, i) => (
                            <div
                                key={field.key}
                                className={`grid border-b border-gray-100 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                                style={{ gridTemplateColumns: `200px repeat(${selected.length}, 1fr)` }}
                            >
                                <div className="p-4 text-sm font-medium text-gray-500">
                                    {field.label}
                                </div>
                                {selected.map(scheme => (
                                    <div key={scheme.id} className="p-4 border-l border-gray-200 text-sm text-gray-700">
                                        {field.render(scheme) || <span className="text-gray-300">—</span>}
                                    </div>
                                ))}
                            </div>
                        ))}

                        {/* View details row */}
                        <div
                            className="grid bg-gray-50 border-t border-gray-200"
                            style={{ gridTemplateColumns: `200px repeat(${selected.length}, 1fr)` }}
                        >
                            <div className="p-4 text-sm font-medium text-gray-500">Details</div>
                            {selected.map(scheme => (
                                <div key={scheme.id} className="p-4 border-l border-gray-200">
                                    <Link
                                        href={`/schemes/${scheme.slug}`}
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        View full details →
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}