import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://workhire.com'
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/jobs', '/login', '/register', '/about', '/contact', '/privacy', '/terms'],
      disallow: ['/dashboard/', '/company/dashboard/', '/admin/', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
