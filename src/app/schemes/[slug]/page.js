import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Info, HelpCircle } from 'lucide-react'
import SaveButton from './SaveButton'
import Navbar from '@/app/components/navbar'
import SchemeAnalytics from './SchemeAnalytics'
import ApplyButton from './ApplyButton'

export default async function SchemePage({ params }) {
  const { slug } = await params

  const { data: scheme } = await supabase
    .from('schemes')
    .select('*, categories(name, slug)')
    .eq('slug', slug)
    .single()

  if (!scheme) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Scheme not found</h1>
          <Link href="/browse" className="text-blue-600 hover:underline">Back to browse</Link>
        </div>
      </main>
    )
  }

  const { data: eligibility } = await supabase
    .from('eligibility')
    .select('*')
    .eq('scheme_id', scheme.id)
    .single()

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar activePage="" />
      <SchemeAnalytics schemeId={scheme.id} />

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Back button */}
        <Link href="/browse" className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Browse
        </Link>

        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {scheme.categories?.name}
            </span>
            <SaveButton schemeId={scheme.id} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">{scheme.title}</h1>
          <div className="flex items-center gap-4 mb-4">
            <p className="text-gray-500 text-sm">Provider: {scheme.provider}</p>
            {scheme.last_scraped && (
              <span className="text-xs bg-green-50 text-green-600 border border-green-200 px-2 py-1 rounded-full">
                ✓ Updated {new Date(scheme.last_scraped).toLocaleDateString('en-SG', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            )}
            {!scheme.last_scraped && (
              <span className="text-xs bg-gray-50 text-gray-500 border border-gray-200 px-2 py-1 rounded-full">
                Manually verified
              </span>
            )}
          </div>
          <p className="text-gray-700 leading-relaxed">{scheme.description}</p>

          {scheme.amount && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-green-700 font-medium">💰 Amount / Coverage</p>
              <p className="text-green-800 font-semibold mt-1">{scheme.amount}</p>
            </div>
          )}
        </div>

        {/* How it works */}
        {scheme.how_it_works && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">How It Works</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">{scheme.how_it_works}</p>
          </div>
        )}

        {/* Eligibility */}
        {eligibility && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">Who Is Eligible</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {eligibility.citizenship && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Citizenship</p>
                  <p className="text-gray-800 font-medium">{eligibility.citizenship}</p>
                </div>
              )}
              {eligibility.income_ceiling && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Income Ceiling</p>
                  <p className="text-gray-800 font-medium">{eligibility.income_ceiling}</p>
                </div>
              )}
              {eligibility.min_age && eligibility.max_age && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Age Range</p>
                  <p className="text-gray-800 font-medium">{eligibility.min_age} - {eligibility.max_age} years old</p>
                </div>
              )}
              {eligibility.other_criteria && (
                <div className="bg-gray-50 rounded-xl p-4 md:col-span-2">
                  <p className="text-xs text-gray-500 mb-1">Other Criteria</p>
                  <p className="text-gray-800 font-medium">{eligibility.other_criteria}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* How to apply */}
        {scheme.apply_url && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">How To Apply</h2>
            </div>
            <p className="text-gray-700 mb-6">Click the button below to go to the official application page.</p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                  <ApplyButton applyUrl={scheme.apply_url} schemeId={scheme.id} />
              </div>
              <Link
                href={`/compare?scheme=${scheme.slug}`}
                className="text-sm text-gray-400 hover:text-blue-600 transition flex items-center gap-1"
              >
                Compare this scheme with others →
              </Link>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
          <p className="text-yellow-800 text-sm">
            ⚠️ <strong>Disclaimer:</strong> This information is for reference only and may not reflect the latest updates. Always verify details on the official provider website before applying.
          </p>
        </div>
      </div>
    </main>
  )
}