// 📡 API: Upload file to Cloudinary (with Local Fallback)
// 🌐 POST /api/upload

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/auth'
import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'
import path from 'path'
import { checkRateLimit, getClientIp } from '@/lib/rateLimit'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:    process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers)
    const limit = checkRateLimit(`upload:${ip}`, 20, 60_000)
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many uploads. Please wait and try again.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSec) } }
      )
    }

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file     = formData.get('file') as File
    const rawType = formData.get('type')
    const type = rawType === 'avatar' ? 'avatar' : 'resume'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (type === 'resume' && file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files allowed' }, { status: 400 })
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be under 5MB' }, { status: 400 })
    }

    // Convert to buffer
    const bytes  = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    let fileUrl = ''
    try {
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        throw new Error('Cloudinary credentials not configured in environment')
      }

      // Upload to Cloudinary
      const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder:        `workhire/${type}s`,
            resource_type: type === 'resume' ? 'raw' : 'image',
            public_id:     `${session.user.id}_${Date.now()}`,
          },
          (error, result) => {
            if (error || !result?.secure_url) reject(error || new Error('Upload failed'))
            else resolve({ secure_url: result.secure_url })
          }
        )
        uploadStream.end(buffer)
      })
      fileUrl = result.secure_url
    } catch (cloudinaryError) {
      console.warn('Cloudinary upload failed, falling back to local storage:', cloudinaryError)
      
      // Local upload fallback
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', `${type}s`)
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }
      
      const fileName = `${session.user.id}_${Date.now()}${type === 'resume' ? '.pdf' : '.png'}`
      const filePath = path.join(uploadDir, fileName)
      fs.writeFileSync(filePath, buffer)
      
      fileUrl = `/uploads/${type}s/${fileName}`
    }

    return NextResponse.json({ url: fileUrl })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
