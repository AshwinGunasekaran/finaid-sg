'use client'

import { useEffect } from 'react'

export default function SchemeAnalytics({ schemeId }) {
  useEffect(() => {
    // Track view event
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schemeId, eventType: 'view' })
    })
  }, [schemeId])

  return null
}