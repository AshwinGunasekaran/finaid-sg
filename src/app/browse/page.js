import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Search, GraduationCap, Shield, Wallet, BookOpen } from 'lucide-react'

const categoryIcons = {
  'scholarships': GraduationCap,
  'student-loans': BookOpen,
  'insurance': Shield,
  'financial-assistance': Wallet,
}

export default async function BrowsePage({ searchParams }) {
  const params = await searchParams
  const selectedCategory = params?.category || null

  const { data: categories } = await supabase
    .from('categories')
    .select('*')

  let query = supabase
    .from('schemes')
    .select('*, categories(name, slug)')
    .eq('is_active', true)

  if (selectedCategory) {
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', selectedCategory)
      .single()

    if (categoryData) {
      query = query.eq('category_id', categoryData.id)
    }
  }

  const { data: schemes } = await query

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-600">
            FinAid SG
          </Link>
          <div className="flex gap-6 text-sm text-gray-600">
            <Link href="/browse" className="text-blue-600 font-medium">Browse</Link>
            <Link href="/chat" className="hover:text-blue-600">AI Assistant</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Browse Schemes</h1>
        <p className="text-gray-500 mb-8">Find scholarships, loans, insurance and subsidies available in Singapore</p>

        {/* Search bar */}
        <div className="flex items-center bg-white border border-gray-200 rounded-full px-5 py-3 mb-8 max-w-xl">
          <Search className="text-gray-400 w-5 h-5 mr-3" />
          <input
            type="text"
            placeholder="Search schemes..."
            className="bg-transparent flex-1 outline-none text-gray-700 text-sm"
          />
        </div>

        {/* Category filters */}
        <div className="flex gap-3 flex-wrap mb-8">
          <Link
            href="/browse"
            className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
              !selectedCategory
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
            }`}
          >
            All
          </Link>
          {categories?.map((cat) => {
            const Icon = categoryIcons[cat.slug] || Wallet
            return (
              <Link
                key={cat.id}
                href={`/browse?category=${cat.slug}`}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition flex items-center gap-2 ${
                  selectedCategory === cat.slug
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.name}
              </Link>
            )
          })}
        </div>

        {/* Schemes grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schemes?.length === 0 && (
            <p className="text-gray-500 col-span-3">No schemes found for this category.</p>
          )}
          {schemes?.map((scheme) => (
            <Link
              key={scheme.id}
              href={`/schemes/${scheme.slug}`}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition"
            >
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                {scheme.categories?.name}
              </span>
              <h3 className="font-semibold text-gray-900 mt-3 mb-2">{scheme.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-3">{scheme.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm font-medium text-green-600">{scheme.amount}</p>
                <span className="text-xs text-blue-600 hover:underline">View details →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}