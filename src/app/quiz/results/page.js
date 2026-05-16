import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Navbar from '@/app/components/navbar'
import { CheckCircle, ArrowLeft } from 'lucide-react'

export default async function QuizResultsPage({ searchParams }) {
  const params = await searchParams
  const { citizenship, age, income, need, studying } = params

  // Build query based on answers
  let query = supabase
    .from('schemes')
    .select('*, categories(name, slug)')
    .eq('is_active', true)

  // Filter by category based on what they need
  if (need) {
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', need)
      .single()

    if (categoryData) {
      query = query.eq('category_id', categoryData.id)
    }
  }

  const { data: schemes } = await query

  // Filter by eligibility
  const filtered = schemes?.filter(scheme => {
    // Foreigner filter - remove government schemes
    if (citizenship === 'foreigner') {
      const govProviders = ['Ministry of Education Singapore', 'CPF Board', 'Ministry of Social and Family Development', 'Ministry of Manpower Singapore', 'SkillsFuture Singapore', 'Community Development Council Singapore']
      if (govProviders.includes(scheme.provider)) return false
    }
    return true
  }) || []

  // Generate a summary of their answers
  const citizenshipLabel = {
    citizen: 'Singapore Citizen',
    pr: 'Permanent Resident',
    foreigner: 'Foreigner / Work Pass Holder'
  }[citizenship]

  const needLabel = {
    'scholarships': 'Scholarships',
    'student-loans': 'Student Loans',
    'housing-loans': 'Housing Loans',
    'car-loans': 'Car Loans',
    'personal-loans': 'Personal Loans',
    'insurance': 'Insurance',
    'financial-assistance': 'Financial Assistance',
    'business-loans': 'Business Loans'
  }[need]

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar activePage="" />

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center bg-green-100 rounded-full p-3 mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Your Matched Schemes
          </h1>
          <p className="text-gray-500 text-sm">
            Based on your profile — {citizenshipLabel} looking for {needLabel}
          </p>
        </div>

        {/* Results count */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-8 flex items-center justify-between">
          <p className="text-blue-700 font-medium">
            {filtered.length} scheme{filtered.length !== 1 ? 's' : ''} found matching your profile
          </p>
          <Link
            href="/quiz"
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Retake quiz
          </Link>
        </div>

        {/* No results */}
        {filtered.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
            <p className="text-gray-500 mb-4">No schemes found matching your profile.</p>
            <Link href="/browse" className="text-blue-600 hover:underline text-sm">
              Browse all schemes instead →
            </Link>
          </div>
        )}

        {/* Scheme cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {filtered.map((scheme) => (
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
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm font-medium text-green-600">{scheme.amount}</p>
                <span className="text-xs text-blue-600">View details →</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Browse all */}
        <div className="text-center mt-10">
          <p className="text-gray-500 text-sm mb-3">Want to see more options?</p>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-full text-sm font-medium hover:border-blue-300 transition"
          >
            Browse All Schemes
          </Link>
        </div>
      </div>
    </main>
  )
}