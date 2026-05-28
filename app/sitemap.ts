import { MetadataRoute } from 'next'
import connectDB from '@/lib/db'
import Job from '@/models/Job'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    await connectDB()
    
    // Fetch all active jobs to populate in sitemap
    const jobs = await Job.find({ status: 'active' })
      .select('_id updatedAt')
      .lean() as any[]
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://workhire.com'
    
    const jobEntries = jobs.map(job => ({
      url: `${baseUrl}/jobs/${job._id.toString()}`,
      lastModified: job.updatedAt ? new Date(job.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    const staticEntries = [
      {
        url: `${baseUrl}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1.0,
      },
      {
        url: `${baseUrl}/jobs`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/login`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      },
      {
        url: `${baseUrl}/register`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      },
      {
        url: `${baseUrl}/privacy`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.4,
      },
      {
        url: `${baseUrl}/terms`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.4,
      },
    ]

    return [...staticEntries, ...jobEntries]
  } catch (error) {
    console.error('Sitemap generation error:', error)
    // Return static entries as fallback
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://workhire.com'
    return [
      {
        url: `${baseUrl}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1.0,
      },
      {
        url: `${baseUrl}/jobs`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
    ]
  }
}
