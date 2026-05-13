import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Search, GraduationCap, Shield, Wallet, BookOpen, Home as HomeIcon, CreditCard, Car, Building } from 'lucide-react'
import SearchBar from './browse/SearchBar'

const categoryIcons = {
  'scholarships': GraduationCap,
  'student-loans': BookOpen,
  'insurance': Shield,
  'financial-assistance': Wallet,
  'housing-loans': HomeIcon,
  'personal-loans': CreditCard,
  'car-loans': Car,
  'business-loans': Building,
}

const categoryColors = {
  'scholarships': 'bg-blue-50 text-blue-600 border-blue-200',
  'student-loans': 'bg-purple-50 text-purple-600 border-purple-200',
  'insurance': 'bg-green-50 text-green-600 border-green-200',
  'financial-assistance': 'bg-orange-50 text-orange-600 border-orange-200',
  'housing-loans': 'bg-red-50 text-red-600 border-red-200',
  'personal-loans': 'bg-pink-50 text-pink-600 border-pink-200',
  'car-loans': 'bg-yellow-50 text-yellow-600 border-yellow-200',
  'business-loans': 'bg-teal-50 text-teal-600 border-teal-200',
}

export default async function Home() {
  const { data: categories } = await supabase
    .from('categories')
    .select('*')

  const { data: schemes } = await supabase
    .from('schemes')
    .select('*, categories(name, slug)')
    .limit(3)

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-600">
            FinAid SG
          </Link>
          <div className="flex gap-6 text-sm text-gray-600">
            <Link href="/browse" className="hover:text-blue-600">Browse</Link>
            <Link href="/chat" className="hover:text-blue-600">AI Assistant</Link>
            <Link href="/about" className="hover:text-blue-600">About</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-white border-b border-gray-200 py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find Financial Aid in Singapore
          </h1>
          <p className="text-lg text-gray-500 mb-8">
            Scholarships, loans, insurance and government subsidies — all in one place, always up to date.
          </p>
          <div className="max-w-xl mx-auto">
            <SearchBar selectedCategory={null} />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories?.map((cat) => {
            const Icon = categoryIcons[cat.slug] || Wallet
            const colorClass = categoryColors[cat.slug] || 'bg-gray-50 text-gray-600 border-gray-200'
            return (
              <Link
                key={cat.id}
                href={`/browse?category=${cat.slug}`}
                className={`border rounded-xl p-5 flex flex-col items-center text-center hover:shadow-md transition ${colorClass}`}
              >
                <Icon className="w-8 h-8 mb-3" />
                <span className="font-medium text-sm">{cat.name}</span>
                <span className="text-xs mt-1 opacity-70">{cat.description}</span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Latest Schemes */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Latest Schemes</h2>
          <Link href="/browse" className="text-sm text-blue-600 hover:underline">View all →</Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
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
              <p className="text-sm text-gray-500 line-clamp-2">{scheme.description}</p>
              <p className="text-sm font-medium text-green-600 mt-3">{scheme.amount}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}