import Link from 'next/link'
import Navbar from '@/app/components/navbar'
import { GraduationCap, Shield, Wallet, BookOpen, Home as HomeIcon, CreditCard, Car, Building, ExternalLink } from 'lucide-react'

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <Navbar activePage="home" />

            <div className="max-w-3xl mx-auto px-6 py-16">
                {/* Hero */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">About FinAid SG</h1>
                    <p className="text-lg text-gray-500">
                        A one-stop platform to help Singaporeans find financial aid, scholarships, loans and insurance — all in one place.
                    </p>
                </div>

                {/* Why we built this */}
                <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Why We Built This</h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                        Finding financial aid in Singapore is harder than it should be. Government schemes are scattered across dozens of websites, bank loan details are buried in fine print, and insurance options are overwhelming to compare.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-4">
                        FinAid SG was built to solve this — a single platform that aggregates scholarships, government subsidies, bank loans and insurance products, explains them in plain English, and helps you figure out what you're actually eligible for.
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                        Our AI assistant is powered by Claude and trained on our database of schemes, so you can ask questions in plain language and get helpful, accurate answers instantly.
                    </p>
                </div>

                {/* What we cover */}
                <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">What We Cover</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { icon: GraduationCap, label: 'Scholarships', color: 'text-blue-600 bg-blue-50' },
                            { icon: BookOpen, label: 'Student Loans', color: 'text-purple-600 bg-purple-50' },
                            { icon: Shield, label: 'Insurance', color: 'text-green-600 bg-green-50' },
                            { icon: Wallet, label: 'Financial Aid', color: 'text-orange-600 bg-orange-50' },
                            { icon: HomeIcon, label: 'Housing Loans', color: 'text-red-600 bg-red-50' },
                            { icon: CreditCard, label: 'Personal Loans', color: 'text-pink-600 bg-pink-50' },
                            { icon: Car, label: 'Car Loans', color: 'text-yellow-600 bg-yellow-50' },
                            { icon: Building, label: 'Business Loans', color: 'text-teal-600 bg-teal-50' },
                        ].map(({ icon: Icon, label, color }) => (
                            <div key={label} className={`rounded-xl p-4 flex flex-col items-center text-center ${color}`}>
                                <Icon className="w-6 h-6 mb-2" />
                                <span className="text-sm font-medium">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* How it works */}
                <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">How It Works</h2>
                    <div className="space-y-6">
                        {[
                            {
                                step: '01',
                                title: 'Automated Data Collection',
                                description: 'Our scrapers automatically visit government and bank websites weekly to keep scheme information up to date.'
                            },
                            {
                                step: '02',
                                title: 'Structured Database',
                                description: 'All schemes are stored in a structured database with eligibility criteria, amounts and application links.'
                            },
                            {
                                step: '03',
                                title: 'AI-Powered Assistant',
                                description: 'Our chatbot uses Claude AI and retrieval-augmented generation (RAG) to answer your questions using real data from our database.'
                            },
                            {
                                step: '04',
                                title: 'Always Up To Date',
                                description: 'Schemes are automatically re-scraped every week and manually reviewed to ensure accuracy.'
                            },
                        ].map(({ step, title, description }) => (
                            <div key={step} className="flex gap-4">
                                <div className="text-2xl font-bold text-blue-100 w-10 shrink-0">{step}</div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Built by */}
                <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Built By</h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                        FinAid SG was built by <strong>Ashwin Gunasekaran</strong> as a portfolio project to make financial aid more accessible for Singaporeans.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Built with Next.js, Supabase, Claude API, Playwright and deployed on Vercel.
                    </p>

                    <a
                        href="https://github.com/AshwinGunasekaran/finaid-sg"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-700 transition"
                    >
                        <ExternalLink className="w-4 h-4" />
                        View on GitHub
                    </a>
                </div>

                {/* Disclaimer */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                    <p className="text-yellow-800 text-sm leading-relaxed">
                        ⚠️ <strong>Disclaimer:</strong> FinAid SG is for informational purposes only. While we strive to keep information accurate and up to date, always verify details on the official provider website before making any financial decisions or submitting applications.
                    </p>
                </div>
            </div>
        </main>
    )
}