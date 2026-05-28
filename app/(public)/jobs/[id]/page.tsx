// 📄 PAGE: Job Detail + Apply
// 🌐 URL: /jobs/[id]
// 👤 WHO: Public view, apply needs login

import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/auth'
import connectDB from '@/lib/db'
import Job from '@/models/Job'
import Application from '@/models/Application'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ApplyButton from '@/components/jobs/ApplyButton'
import type { Metadata } from 'next'

interface Props { 
  params: Promise<{ id: string }> 
}

type JobDetail = {
  _id: { toString: () => string }
  title: string
  description: string
  status: string
  type: string
  location?: string
  experience?: string
  applicantCount: number
  createdAt?: Date | string
  deadline?: Date | string
  requirements?: string[]
  skills?: string[]
  salary?: { min?: number; max?: number; currency?: string }
  companyId?: {
    name?: string
    logo?: string
    location?: string
    industry?: string
    website?: string
    description?: string
    size?: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await connectDB()
  const { id } = await params
  try {
    const job = await Job.findById(id).populate('companyId', 'name').lean() as unknown as JobDetail | null
    if (!job || job.status !== 'active') {
      return {
        title: 'Job Not Found | WorkHire',
      }
    }
    return {
      title: `${job.title} at ${job.companyId?.name || 'Verified Recruiter'} | WorkHire`,
      description: `Apply for the ${job.title} position at ${job.companyId?.name || 'Verified Recruiter'} on WorkHire. ${job.description.slice(0, 160)}...`,
    }
  } catch {
    return {
      title: 'Job Details | WorkHire',
    }
  }
}

export default async function JobDetailPage({ params }: Props) {
  await connectDB()

  const { id: jobId } = await params

  const job = await Job.findById(jobId)
    .populate('companyId', 'name logo location industry website description size')
    .lean() as unknown as JobDetail | null

  if (!job || job.status !== 'active') notFound()

  const session = await getServerSession(authOptions)

  // Check if already applied
  let alreadyApplied = false
  if (session?.user.role === 'jobseeker') {
    const existing = await Application.findOne({
      jobId,
      seekerId: session.user.id,
    })
    alreadyApplied = !!existing
  }

  const typeColors: Record<string, string> = {
    'full-time':  'bg-[#e2dfff] text-[#3525cd]',
    'part-time':  'bg-[#e5eeff] text-[#4648d4]',
    'remote':     'bg-green-50 text-green-600',
    'internship': 'bg-amber-50 text-amber-600',
    'contract':   'bg-[#ffdad6] text-[#93000a]',
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    'title': job.title,
    'description': job.description,
    'datePosted': job.createdAt ? new Date(job.createdAt).toISOString() : new Date().toISOString(),
    'validThrough': job.deadline ? new Date(job.deadline).toISOString() : undefined,
    'employmentType': job.type.toUpperCase().replace('-', '_'),
    'hiringOrganization': {
      '@type': 'Organization',
      'name': job.companyId?.name || 'Verified Recruiter',
      'logo': job.companyId?.logo || undefined,
      'sameAs': job.companyId?.website || undefined,
    },
    'jobLocation': {
      '@type': 'Place',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': job.location || 'Remote',
        'addressCountry': 'Global',
      },
    },
    'baseSalary': job.salary?.min ? {
      '@type': 'MonetaryAmount',
      'currency': job.salary.currency || 'INR',
      'value': {
        '@type': 'QuantitativeValue',
        'minValue': job.salary.min,
        'maxValue': job.salary.max || job.salary.min,
        'unitText': 'MONTH',
      },
    } : undefined,
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff]" style={{ fontFamily: 'Geist, sans-serif' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Navbar */}
      <nav className="sticky top-0 bg-white border-b border-[#c7c4d8] z-50">
        <div className="flex justify-between items-center px-4 md:px-10 py-4 max-w-[1440px] mx-auto">
          <Link href="/" className="text-xl font-bold text-[#3525cd]">WorkHire</Link>
          <div className="flex items-center gap-4">
            <Link href="/jobs" className="text-sm text-[#464555] hover:text-[#3525cd]">← Browse Jobs</Link>
            {session ? (
              <Link href="/dashboard" className="px-4 py-2 rounded-xl bg-[#3525cd] text-white text-sm font-semibold hover:opacity-90">
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="px-4 py-2 rounded-xl bg-[#3525cd] text-white text-sm font-semibold hover:opacity-90">
                Login to Apply
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-[1100px] mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">

            {/* Job header */}
            <div className="bg-white rounded-xl border border-[#c7c4d8] p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-[#e2dfff] flex items-center justify-center text-[#3525cd] font-bold text-2xl shrink-0">
                  {job.companyId?.name?.charAt(0) || '?'}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-[#0b1c30]" style={{ letterSpacing: '-0.01em' }}>
                    {job.title}
                  </h1>
                  <p className="text-[#464555] mt-1">{job.companyId?.name}</p>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${typeColors[job.type]}`}>
                      {job.type}
                    </span>
                    {job.location && (
                      <span className="text-xs px-3 py-1 rounded-full bg-[#eff4ff] text-[#464555]">
                        📍 {job.location}
                      </span>
                    )}
                    {job.experience && (
                      <span className="text-xs px-3 py-1 rounded-full bg-[#eff4ff] text-[#464555]">
                        💼 {job.experience} yrs exp
                      </span>
                    )}
                    {job.salary?.min && (
                      <span className="text-xs px-3 py-1 rounded-full bg-[#eff4ff] text-[#464555]">
                        💰 ₹{job.salary.min.toLocaleString()} – ₹{job.salary.max?.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl border border-[#c7c4d8] p-6">
              <h2 className="font-semibold text-[#0b1c30] mb-4">Job Description</h2>
              <div className="text-sm text-[#464555] leading-relaxed whitespace-pre-wrap">
                {job.description}
              </div>
            </div>

            {/* Requirements */}
            {(job.requirements?.length ?? 0) > 0 && (
              <div className="bg-white rounded-xl border border-[#c7c4d8] p-6">
                <h2 className="font-semibold text-[#0b1c30] mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {(job.requirements ?? []).map((req: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#464555]">
                      <span className="text-[#3525cd] mt-0.5 shrink-0">✓</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills */}
            {(job.skills?.length ?? 0) > 0 && (
              <div className="bg-white rounded-xl border border-[#c7c4d8] p-6">
                <h2 className="font-semibold text-[#0b1c30] mb-4">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {(job.skills ?? []).map((skill: string) => (
                    <span key={skill} className="px-3 py-1.5 rounded-xl bg-[#e2dfff] text-[#3525cd] text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Sidebar */}
          <div className="space-y-4">

            {/* Apply card */}
            <div className="bg-white rounded-xl border border-[#c7c4d8] p-5 sticky top-20">
              <div className="mb-4">
                <p className="text-xs text-[#777587]">
                  {job.applicantCount} applicant{job.applicantCount !== 1 ? 's' : ''}
                </p>
                {job.deadline && (
                  <p className="text-xs text-amber-600 mt-0.5">
                    ⏰ Deadline: {new Date(job.deadline).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </p>
                )}
              </div>

              <ApplyButton
                jobId={jobId}
                isLoggedIn={!!session}
                isJobSeeker={session?.user.role === 'jobseeker'}
                alreadyApplied={alreadyApplied}
              />
            </div>

            {/* Company info */}
            <div className="bg-white rounded-xl border border-[#c7c4d8] p-5">
              <h3 className="font-semibold text-[#0b1c30] mb-3">About the Company</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#e2dfff] flex items-center justify-center text-[#3525cd] font-bold">
                  {job.companyId?.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#0b1c30]">{job.companyId?.name}</p>
                  <p className="text-xs text-[#777587]">{job.companyId?.industry}</p>
                </div>
              </div>
              {job.companyId?.description && (
                <p className="text-xs text-[#464555] leading-relaxed mb-3 line-clamp-3">
                  {job.companyId.description}
                </p>
              )}
              <div className="space-y-1">
                {job.companyId?.location && (
                  <p className="text-xs text-[#777587]">📍 {job.companyId.location}</p>
                )}
                {job.companyId?.size && (
                  <p className="text-xs text-[#777587]">👥 {job.companyId.size} employees</p>
                )}
                {job.companyId?.website && (
                  <a
                    href={job.companyId.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#3525cd] hover:underline block"
                  >
                    🌐 Visit Website
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
