// 📡 API: AI Cover Letter Generator
// 🌐 POST /api/ai/cover-letter
// 👤 WHO: Authenticated users only

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

    const { jobTitle, companyName, jobDescription, skills, experience } = await req.json()

    if (!jobTitle) {
      return NextResponse.json({ error: 'Job title is required' }, { status: 400 })
    }

    const prompt = `
You are an expert career consultant and professional resume/cover letter writer.

Generate a highly customized, compelling, and professional cover letter for the following role:

JOB DETAILS:
- Title: ${jobTitle}
- Company: ${companyName || 'Target Company'}
${jobDescription ? `- Job Description / Requirements:\n${jobDescription}\n` : ''}
MY PROFILE:
${skills ? `- My Skills: ${skills}` : ''}
${experience ? `- My Experience: ${experience}` : ''}

INSTRUCTIONS:
1. Write a professional, polite, and persuasive cover letter.
2. Structure the letter with:
   - Header placeholders (Date, Hiring Manager, Company Name, etc.)
   - Engaging opening hook explaining enthusiasm for the role and company.
   - Body paragraphs highlighting relevant skills, projects, or experiences matching the job details.
   - Strong call-to-action closing paragraph requesting an interview.
3. Align the tone with the industry (e.g. modern & energetic for startups, professional & structured for enterprise).
4. Keep the length under 400 words.
5. Write ONLY the cover letter. Do not include any preambles, introductory thoughts, conversational notes, or post-generation remarks. Start directly with the cover letter text or standard placeholders.
`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
      temperature: 0.7,
    })

    const coverLetter = completion.choices[0]?.message?.content?.trim()

    if (!coverLetter) {
      return NextResponse.json({ error: 'Failed to generate cover letter' }, { status: 500 })
    }

    return NextResponse.json({ coverLetter })

  } catch (error) {
    console.error('Cover letter AI error:', error)
    return NextResponse.json({ error: 'AI service error' }, { status: 500 })
  }
}
