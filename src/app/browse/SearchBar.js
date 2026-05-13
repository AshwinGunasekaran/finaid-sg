'use client'

import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function SearchBar({ selectedCategory }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('search') || '')

  function handleSearch(e) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (selectedCategory) params.set('category', selectedCategory)
    if (query.trim()) params.set('search', query.trim())
    router.push(`/browse?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch}>
      <div className="flex items-center bg-white border border-gray-200 rounded-full px-5 py-3 mb-8 max-w-xl">
        <Search className="text-gray-400 w-5 h-5 mr-3" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search schemes..."
          className="bg-transparent flex-1 outline-none text-gray-700 text-sm"
        />
        <button type="submit" className="text-blue-600 text-sm font-medium ml-2">
          Search
        </button>
      </div>
    </form>
  )
}