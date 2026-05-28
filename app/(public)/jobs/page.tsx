// 📄 PAGE: Browse Jobs
// 🌐 URL: /jobs
// 👤 WHO: Public (everyone)

import connectDB from '@/lib/db'
import Job from '@/models/Job'
import '@/models/Company' // register Company schema for populate
import Link from 'next/link'
import type { Metadata } from 'next'
import { 
  Search, 
  MapPin, 
  Briefcase, 
  SlidersHorizontal,
  X,
  Compass,
  ArrowUpRight
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Browse Live Jobs & Openings Worldwide | WorkHire',
  description:
    'Search thousands of verified global job openings across technology, healthcare, education, marketing, sales, and design. Filter by location, job type, and salary to land your next dream role.',
}

interface Props {
  searchParams: Promise<{
    search?: string
    type?: string
    location?: string
    page?: string
  }>
}

type JobCard = {
  _id: { toString: () => string }
  title: string
  type: string
  location?: string
  experience?: string
  createdAt: Date | string
  skills?: string[]
  salary?: { min?: number; max?: number; currency?: string }
  companyId?: { name?: string; industry?: string }
}

export default async function JobsPage({ searchParams }: Props) {
  await connectDB()

  const params = await searchParams
  const filter: Record<string, unknown> = { status: 'active' }
  if (params.search)   filter.title    = new RegExp(params.search, 'i')
  if (params.type)     filter.type     = params.type
  if (params.location) filter.location = new RegExp(params.location, 'i')

  const page  = Number(params.page || 1)
  const limit = 10
  const skip  = (page - 1) * limit

  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .populate('companyId', 'name logo location industry')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Job.countDocuments(filter),
  ])

  const pages = Math.ceil(total / limit)
  const typedJobs = jobs as unknown as JobCard[]

  const typeColors: Record<string, string> = {
    'full-time':  'bg-primary/10 text-primary border-primary/20',
    'part-time':  'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
    'remote':     'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    'internship': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    'contract':   'bg-rose-500/10 text-rose-600 border-rose-500/20',
  }

  const jobTypes = [
    { value: '',           label: 'All Types'  },
    { value: 'full-time',  label: 'Full Time'  },
    { value: 'part-time',  label: 'Part Time'  },
    { value: 'remote',     label: 'Remote'     },
    { value: 'internship', label: 'Internship' },
    { value: 'contract',   label: 'Contract'   },
  ]

  return (
    <div className="min-h-screen bg-[#fafbff] text-[#0b1215] selection:bg-primary/20 selection:text-primary relative overflow-hidden flex flex-col justify-between">
      
      {/* Background blobs */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/3 left-10 w-[300px] h-[300px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      {/* Navbar */}
      <nav className="sticky top-0 bg-white/85 backdrop-blur-md border-b border-[#e2e8f0] z-50 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex justify-between items-center px-6 md:px-10 py-3.5 max-w-[1440px] mx-auto">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight">WorkHire</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs font-semibold text-muted hover:text-foreground transition-colors hidden sm:block">
              Home
            </Link>
            <Link href="/login" className="text-xs font-semibold text-muted hover:text-foreground transition-colors px-2 py-1">
              Sign In
            </Link>
            <Link href="/register" className="btn-premium-primary px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all shadow-sm">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero search area - Compact Screen-Fit */}
      <div className="bg-gradient-to-br from-[#3525cd] to-[#4338ca] py-10 px-6 text-white relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 px-3 py-1 rounded-full text-[10px] font-semibold">
            <Compass className="w-3 h-3" />
            <span>Discover live job vacancies</span>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">
            Find your dream career path
          </h1>
          <p className="text-white/70 text-xs max-w-md mx-auto leading-relaxed">
            Search <span className="text-white font-bold">{total}</span> positions available currently across top companies.
          </p>

          {/* Search form */}
          <form className="bg-white/15 backdrop-blur-md border border-white/15 p-1.5 rounded-2xl flex flex-col md:flex-row gap-1.5 max-w-3xl mx-auto shadow-lg">
            
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50 w-4 h-4" />
              <input
                type="text"
                name="search"
                defaultValue={params.search}
                placeholder="Job title, keywords..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-transparent rounded-xl text-xs text-white placeholder:text-white/60 focus:outline-none focus:bg-white/20 focus:border-white/20 transition-all"
              />
            </div>

            <div className="md:w-48 relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50 w-4 h-4" />
              <input
                type="text"
                name="location"
                defaultValue={params.location}
                placeholder="City or state..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-transparent rounded-xl text-xs text-white placeholder:text-white/60 focus:outline-none focus:bg-white/20 focus:border-white/20 transition-all"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-white text-primary text-xs font-bold hover:bg-[#e2dfff] transition-colors shadow-sm cursor-pointer hover:scale-[1.01] active:scale-[0.99] duration-150"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Main content grid */}
      <div className="max-w-[1200px] w-full mx-auto px-4 md:px-6 py-8 flex-1">
        <div className="flex flex-col md:flex-row gap-6">

          {/* Filters Sidebar - Desktop Only */}
          <aside className="hidden md:block w-52 shrink-0">
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 sticky top-20 shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
              <div className="flex items-center gap-1.5 text-foreground font-bold text-xs uppercase tracking-wide border-b border-slate-100 pb-2.5 mb-3.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
                <span>Filter Vacancies</span>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-[9px] font-bold text-muted uppercase tracking-wider mb-2">Job Type</p>
                  <div className="space-y-1">
                    {jobTypes.map(({ value, label }) => {
                      const active = params.type === value || (!params.type && !value)
                      return (
                        <Link
                          key={value}
                          href={value
                            ? `/jobs?type=${value}${params.search ? `&search=${params.search}` : ''}`
                            : `/jobs${params.search ? `?search=${params.search}` : ''}`
                          }
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-semibold transition-all group
                            ${active
                              ? 'bg-primary/5 text-primary shadow-[inset_0_0_0_1px_rgba(79,70,229,0.05)]'
                              : 'text-[#464555] hover:bg-slate-50 hover:text-foreground'
                            }`}
                        >
                          <span>{label}</span>
                          {active && (
                            <span className="w-1 h-1 rounded-full bg-primary" />
                          )}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Jobs Listing Column */}
          <div className="flex-1 space-y-4">
            
            {/* Horizontal Filter Pill bar - Mobile Only */}
            <div className="flex md:hidden overflow-x-auto gap-2 pb-2 -mx-1 scrollbar-none select-none">
              {jobTypes.map(({ value, label }) => {
                const active = params.type === value || (!params.type && !value)
                return (
                  <Link
                    key={value}
                    href={value
                      ? `/jobs?type=${value}${params.search ? `&search=${params.search}` : ''}`
                      : `/jobs${params.search ? `?search=${params.search}` : ''}`
                    }
                    className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border
                      ${active
                        ? 'bg-primary border-primary text-white shadow-sm'
                        : 'bg-white border-slate-200 text-muted hover:border-slate-300'
                      }`}
                  >
                    {label}
                  </Link>
                )
              })}
            </div>

            {/* Header info bar */}
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
              <p className="text-[10px] font-bold text-muted uppercase tracking-wider">
                Showing <span className="text-foreground font-extrabold">{total}</span> jobs 
                {params.search && (
                  <> for <span className="text-primary font-extrabold">&quot;{params.search}&quot;</span></>
                )}
              </p>
              
              {(params.search || params.type || params.location) && (
                <Link 
                  href="/jobs" 
                  className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all"
                >
                  <X className="w-3 h-3" />
                  Clear Filters
                </Link>
              )}
            </div>

            {/* Jobs List container */}
            {typedJobs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center shadow-sm">
                <p className="text-3xl mb-3">🔍</p>
                <h3 className="text-sm font-bold text-foreground mb-1">No vacancies found</h3>
                <p className="text-xs text-muted">Try using different search keywords or resetting your type filters.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {typedJobs.map(job => (
                  <Link
                    key={job._id.toString()}
                    href={`/jobs/${job._id}`}
                    className="block bg-white rounded-2xl border border-slate-100 hover:border-primary/15 hover:shadow-[0_4px_20px_rgba(79,70,229,0.03)] p-5 transition-all group relative overflow-hidden"
                  >
                    {/* Hover border glow strip */}
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-center duration-300" />

                    <div className="flex items-start gap-4">
                      
                      {/* Logo avatar */}
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-primary/5 border border-primary/10 flex items-center justify-center text-primary font-bold text-base shrink-0 group-hover:scale-102 transition-transform">
                        {job.companyId?.name?.charAt(0).toUpperCase() || '?'}
                      </div>

                      {/* Job details */}
                      <div className="flex-1 min-w-0 space-y-2">
                        
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <h2 className="text-xs md:text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                              {job.title}
                            </h2>
                            <p className="text-[10px] text-muted font-medium mt-0.5">{job.companyId?.name}</p>
                          </div>
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider shrink-0 ${typeColors[job.type] || 'bg-slate-100 text-slate-700'}`}>
                            {job.type}
                          </span>
                        </div>

                        {/* Location / Salary / Experience meta */}
                        <div className="flex flex-wrap gap-x-3 gap-y-1 pt-0.5">
                          {job.location && (
                            <span className="text-[10px] font-semibold text-muted flex items-center gap-0.5">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {job.location}
                            </span>
                          )}
                           {job.salary?.min && (
                             <span className="text-[10px] font-semibold text-muted flex items-center gap-0.5">
                               <span className="text-slate-400 font-bold">
                                 {job.salary.currency === 'USD' ? '$' : '₹'}
                               </span>
                               {job.salary.min.toLocaleString()} – {job.salary.currency === 'USD' ? '$' : '₹'}{job.salary.max?.toLocaleString()}
                             </span>
                           )}
                          {job.experience && (
                            <span className="text-[10px] font-semibold text-muted flex items-center gap-0.5">
                              <Briefcase className="w-3 h-3 text-slate-400" />
                              {job.experience} yrs
                            </span>
                          )}
                        </div>

                        {/* Skill Tags */}
                        {(job.skills?.length ?? 0) > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {(job.skills ?? []).slice(0, 4).map((skill: string) => (
                              <span key={skill} className="px-2 py-0.5 rounded-full bg-slate-50 border border-slate-100 text-muted font-bold text-[9px]">
                                {skill}
                              </span>
                            ))}
                            {(job.skills?.length ?? 0) > 4 && (
                              <span className="text-[9px] font-bold text-muted self-center ml-0.5">+{(job.skills?.length ?? 0) - 4} more</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom strip */}
                    <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-slate-50">
                      <span className="text-[9px] font-bold text-muted uppercase tracking-wider">
                        Posted: {new Date(job.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </span>
                      <span className="text-[11px] font-bold text-primary flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                        View Job Details
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>

                  </Link>
                ))}
              </div>
            )}

            {/* Pagination block */}
            {pages > 1 && (
              <div className="flex justify-center gap-1.5 mt-8">
                {Array.from({ length: pages }, (_, i) => i + 1).map(p => {
                  const active = page === p
                  return (
                    <Link
                      key={p}
                      href={`/jobs?page=${p}${params.search ? `&search=${params.search}` : ''}${params.type ? `&type=${params.type}` : ''}`}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all
                        ${active
                          ? 'bg-primary text-white shadow-md shadow-primary/20'
                          : 'bg-white border border-[#e2e8f0] text-muted hover:border-primary/20 hover:text-primary'
                        }`}
                    >
                      {p}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#e2e8f0] bg-white py-6">
        <div className="max-w-[1200px] w-full mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-center">
          <span className="text-[10px] text-muted">&copy; 2026 WorkHire. All rights reserved.</span>
          <div className="flex gap-4">
            {['Privacy Policy', 'Terms of Service', 'Support Help'].map(l => (
              <span key={l} className="text-[10px] text-muted hover:text-primary transition-colors cursor-pointer">{l}</span>
            ))}
          </div>
        </div>
      </footer>

    </div>
  )
}
