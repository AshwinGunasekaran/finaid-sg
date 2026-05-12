import { supabase } from '@/lib/supabase'

export default async function Home() {
  const { data: schemes, error } = await supabase
    .from('schemes')
    .select('*, categories(name)')

  if (error) {
    console.error(error)
    return <div>Error loading schemes</div>
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">FinAid SG</h1>
      <p className="text-gray-600 mb-8">Your financial aid aggregator</p>
      <div className="grid gap-4">
        {schemes.map((scheme) => (
          <div key={scheme.id} className="border rounded-lg p-4">
            <span className="text-sm text-blue-600">{scheme.categories?.name}</span>
            <h2 className="text-xl font-semibold mt-1">{scheme.title}</h2>
            <p className="text-gray-600 mt-2">{scheme.description}</p>
            <p className="text-green-600 font-medium mt-2">{scheme.amount}</p>
          </div>
        ))}
      </div>
    </main>
  )
}