// 📡 API: AI Job Description Generator
// 🌐 POST /api/ai/job-description
// 👤 WHO: Recruiters only

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/auth'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (session.user.role !== 'recruiter') {
      return NextResponse.json({ error: 'Recruiters only' }, { status: 403 })
    }

    const { jobTitle, skills, experience, location, type, companyName, industry } = await req.json()

    if (!jobTitle) {
      return NextResponse.json({ error: 'Job title required' }, { status: 400 })
    }

    const prompt = `
You are an expert HR professional and technical recruiter.

Generate a comprehensive, engaging job description for the following role:

JOB DETAILS:
- Title: ${jobTitle}
- Company: ${companyName || 'Our Company'}
- Industry: ${industry || 'Technology'}
- Location: ${location || 'Remote/Hybrid'}
- Type: ${type || 'Full-time'}
- Experience Required: ${experience || 'Not specified'}
- Key Skills: ${skills || 'Not specified'}

INSTRUCTIONS:
Write a complete job description with these EXACT sections:

ABOUT THE ROLE:
[2-3 sentences about what the role involves and its impact]

KEY RESPONSIBILITIES:
[5-6 bullet points starting with action verbs]

REQUIREMENTS:
[5-6 bullet points of must-have qualifications]

NICE TO HAVE:
[3-4 optional/bonus skills]

WHAT WE OFFER:
[4-5 benefits/perks]

Keep it professional, inclusive, and engaging.
Write ONLY the job description, no preamble.
Use plain text, no markdown formatting.
`

    const completion = await groq.chat.completions.create({
      model:       'llama-3.3-70b-versatile',
      messages:    [{ role: 'user', content: prompt }],
      max_tokens:  800,
      temperature: 0.6,
    })

    const description = completion.choices[0]?.message?.content?.trim()

    if (!description) {
      return NextResponse.json({ error: 'Failed to generate description' }, { status: 500 })
    }

    return NextResponse.json({ description })

  } catch (error) {
    console.error('Job description AI error:', error)
    return NextResponse.json({ error: 'AI service error' }, { status: 500 })
  }
}