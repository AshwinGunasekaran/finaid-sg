'use client'

import { ExternalLink } from 'lucide-react'

export default function ApplyButton({ applyUrl, schemeId }) {
  function handleClick() {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schemeId, eventType: 'click' })
    })
  }

  return (
    <a
      href={applyUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full font-medium hover:bg-blue-700 transition"
    >
      Apply Now
      <ExternalLink className="w-4 h-4" />
    </a>
  )
}