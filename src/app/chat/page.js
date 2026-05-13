'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useState } from 'react'
import Link from 'next/link'
import { Send, Bot, User, Loader2 } from 'lucide-react'

export default function ChatPage() {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hi! I'm your FinAid SG assistant 👋 I can help you find scholarships, loans, insurance and government subsidies in Singapore. What are you looking for?"
        }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)

    async function sendMessage() {
        if (!input.trim() || loading) return

        const userMessage = input.trim()
        setInput('')
        setLoading(true)

        // Add user message to chat
        setMessages(prev => [...prev, { role: 'user', content: userMessage }])

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage })
            })

            const data = await response.json()

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.reply || 'Sorry, something went wrong. Please try again.'
            }])

        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.'
            }])
        }

        setLoading(false)
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col">
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link href="/" className="text-xl font-bold text-blue-600">
                        FinAid SG
                    </Link>
                    <div className="flex gap-6 text-sm text-gray-600">
                        <Link href="/browse" className="hover:text-blue-600">Browse</Link>
                        <Link href="/chat" className="text-blue-600 font-medium">AI Assistant</Link>
                    </div>
                </div>
            </nav>

            {/* Chat header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 rounded-full p-2">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-semibold text-gray-900">FinAid Assistant</h1>
                            <p className="text-xs text-green-500">Online</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="max-w-3xl mx-auto space-y-4">
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {msg.role === 'assistant' && (
                                <div className="bg-blue-600 rounded-full p-2 h-fit mt-1">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                            )}
                            <div
                                className={`max-w-xl px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                    : 'bg-white border border-gray-200 text-gray-700 rounded-tl-none'
                                    }`}
                            >
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        table: ({ node, ...props }) => (
                                            <div className="overflow-x-auto my-2">
                                                <table className="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden" {...props} />
                                            </div>
                                        ),
                                        thead: ({ node, ...props }) => (
                                            <thead className="bg-blue-50 text-blue-700" {...props} />
                                        ),
                                        th: ({ node, ...props }) => (
                                            <th className="px-4 py-2 text-left font-semibold border-b border-gray-200" {...props} />
                                        ),
                                        td: ({ node, ...props }) => (
                                            <td className="px-4 py-2 border-b border-gray-100" {...props} />
                                        ),
                                        tr: ({ node, ...props }) => (
                                            <tr className="hover:bg-gray-50" {...props} />
                                        ),
                                    }}
                                >
                                    {msg.content}
                                </ReactMarkdown>
                            </div>
                            {msg.role === 'user' && (
                                <div className="bg-gray-200 rounded-full p-2 h-fit mt-1">
                                    <User className="w-4 h-4 text-gray-600" />
                                </div>
                            )}
                        </div>
                    ))}

                    {loading && (
                        <div className="flex gap-3 justify-start">
                            <div className="bg-blue-600 rounded-full p-2 h-fit mt-1">
                                <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3">
                                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Input */}
            <div className="bg-white border-t border-gray-200 px-6 py-4">
                <div className="max-w-3xl mx-auto flex gap-3">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask me about scholarships, loans, insurance..."
                        rows={1}
                        className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 text-sm outline-none resize-none text-gray-700 placeholder-gray-400"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={loading || !input.trim()}
                        className="bg-blue-600 text-white rounded-full p-3 hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-xs text-gray-400 text-center mt-2">
                    Always verify information on official websites before applying.
                </p>
            </div>
        </main>
    )
}