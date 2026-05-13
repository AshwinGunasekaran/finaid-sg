import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request) {
  try {
    const { message } = await request.json()

    // Fetch all schemes from database to give Claude context
    const { data: schemes } = await supabase
      .from('schemes')
      .select('*, categories(name)')
      .eq('is_active', true)

    // Format schemes into readable context for Claude
    const schemesContext = schemes.map(s => `
      Name: ${s.title}
      Category: ${s.categories?.name}
      Provider: ${s.provider}
      Description: ${s.description}
      Amount: ${s.amount}
      How it works: ${s.how_it_works}
      Apply at: ${s.apply_url}
    `).join('\n---\n')

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: `You are a helpful financial aid assistant for Singapore. 
You help users find scholarships, loans, insurance and government subsidies.
You have access to the following schemes in the database:

${schemesContext}

Guidelines:
- Answer in a friendly, clear and simple way
- Always mention the scheme name when recommending something
- If a user asks about eligibility, be specific about the criteria
- Always remind users to verify details on the official website before applying
- If you don't know something or it's not in the database, say so honestly
- Keep responses concise but helpful
- Use markdown tables when comparing multiple schemes side by side
- Use bullet points for simple lists`,
      messages: [
        { role: 'user', content: message }
      ]
    })

    return Response.json({ 
      reply: response.content[0].text 
    })

  } catch (error) {
    console.error('Chat error:', error)
    return Response.json({ error: 'Something went wrong' }, { status: 500 })
  }
}