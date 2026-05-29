// 📡 API: AI Resume Analyzer
// 🌐 POST /api/ai/resume-analyzer
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

    const { resumeText, jobDescription } = await req.json()

    if (!resumeText) {
      return NextResponse.json({ error: 'Resume text is required for analysis' }, { status: 400 })
    }

    const prompt = `
You are an expert technical recruiter and ATS (Applicant Tracking System) optimizer.

Analyze the following resume text. Optionally, compare it against the provided Job Description to evaluate compatibility.

RESUME TEXT:
"""
${resumeText}
"""

${jobDescription ? `JOB DESCRIPTION:\n"""\n${jobDescription}\n"""\n` : ''}

INSTRUCTIONS:
Conduct a detailed ATS compatibility and skills analysis. Return your analysis ONLY as a valid, parsable JSON object. Do not include any markdown fences, explanation, preamble, or trailing text. The JSON object MUST strictly match this typescript interface:

interface AnalysisResponse {
  score: number; // ATS Match or Resume Quality Score (0 to 100)
  strengths: string[]; // 3 to 5 key strengths found in the resume
  improvements: string[]; // 3 to 5 actionable suggestions for improvement
  missingSkills: string[]; // List of recommended keywords, technologies or skills to add
}

Ensure the response can be directly parsed with JSON.parse in Node.js.
`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1200,
      temperature: 0.3, // Lower temperature for more structured adherence
    })

    const content = completion.choices[0]?.message?.content?.trim()

    if (!content) {
      return NextResponse.json({ error: 'Failed to analyze resume' }, { status: 500 })
    }

    // Attempt to extract JSON if LLM outputs markdown backticks
    let jsonString = content
    if (content.startsWith('```')) {
      const match = content.match(/^(?:```(?:json)?\n)([\s\S]*?)(?:\n```)$/)
      if (match) {
        jsonString = match[1].trim()
      }
    }

    try {
      const parsedAnalysis = JSON.parse(jsonString)
      return NextResponse.json({ analysis: parsedAnalysis })
    } catch (parseError) {
      console.warn('Failed to parse Groq response as JSON. Content:', content, parseError)
      // Fallback response structure in case of format failure
      return NextResponse.json({
        analysis: {
          score: 70,
          strengths: ['Resume contains readable text and structure'],
          improvements: ['Format resume structure so that AI can parse it consistently'],
          missingSkills: []
        },
        rawText: content
      })
    }

  } catch (error) {
    console.error('Resume analyzer AI error:', error)
    return NextResponse.json({ error: 'AI service error' }, { status: 500 })
  }
}
