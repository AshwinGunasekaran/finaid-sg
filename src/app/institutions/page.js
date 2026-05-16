import { supabaseAdmin } from '@/lib/supabase-admin'
import Navbar from '@/app/components/navbar'
import Link from 'next/link'
import { Building, ExternalLink } from 'lucide-react'

export default async function InstitutionsPage() {
  const { data: institutions } = await supabaseAdmin
    .from('institutions')
    .select('*')
    .eq('status', 'approved')
    .order('name')

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar activePage="institutions" />

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900">Institutions</h1>
          <Link
            href="/institutions/apply"
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition"
          >
            List Your Institution
          </Link>
        </div>
        <p className="text-gray-500 mb-8">
          Browse verified banks, insurers and government agencies listed on FinAid SG
        </p>

        {institutions?.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
            <Building className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 mb-2">No institutions listed yet</p>
            <Link href="/institutions/apply" className="text-blue-600 text-sm hover:underline">
              Be the first to list your institution →
            </Link>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {institutions?.map((institution) => (
            <Link
              key={institution.id}
              href={`/institutions/${institution.slug}`}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden shrink-0">
                  {institution.logo_url ? (
                    <img
                      src={institution.logo_url}
                      alt={institution.name}
                      className="w-10 h-10 object-contain"
                    />
                  ) : (
                    <Building className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{institution.name}</h3>
                    <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                      ✓ Verified
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">{institution.description}</p>
                  {institution.website && (
                    <span className="text-xs text-blue-600 mt-2 inline-flex items-center gap-1">
                      {institution.website.replace('https://', '')} <ExternalLink className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}