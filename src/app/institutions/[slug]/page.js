import { supabaseAdmin } from '@/lib/supabase-admin'
import Navbar from '@/app/components/navbar'
import Link from 'next/link'
import { ExternalLink, Building } from 'lucide-react'
import { notFound } from 'next/navigation'

export default async function InstitutionPage({ params }) {
  const { slug } = await params

  const { data: institution } = await supabaseAdmin
    .from('institutions')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'approved')
    .single()

  if (!institution) notFound()

  const { data: schemes } = await supabaseAdmin
    .from('schemes')
    .select('*, categories(name)')
    .eq('provider', institution.name)
    .eq('is_active', true)

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar activePage="" />

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Institution header */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl border border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden shrink-0">
              {institution.logo_url ? (
                <img
                  src={institution.logo_url}
                  alt={institution.name}
                  className="w-14 h-14 object-contain"
                />
              ) : (
                <Building className="w-8 h-8 text-blue-600" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{institution.name}</h1>
                <span className="text-xs bg-green-50 text-green-600 border border-green-200 px-2 py-1 rounded-full">
                  ✓ Verified
                </span>
              </div>
              <p className="text-gray-500 mb-4">{institution.description}</p>
              {institution.website && (
                <a
                  href={institution.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
                >
                  Visit Website <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Schemes */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Available Schemes ({schemes?.length || 0})
        </h2>

        {schemes?.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
            <p className="text-gray-400">No schemes listed yet</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
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
      </div>
    </main>
  )
}