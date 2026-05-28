// 📄 PAGE: Landing Page
// 🌐 URL: /
// 👤 WHO: Public (everyone)

import Link from 'next/link'
import type { Metadata } from 'next'
import connectDB from '@/lib/db'
import Job from '@/models/Job'
import Company from '@/models/Company'
import User from '@/models/User'
import LandingHeader from '@/components/LandingHeader'
import { 
  ArrowRight,
  Briefcase,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  MessageSquare,
  BarChart3,
  MapPin,
  Building,
  Globe,
  HeartPulse,
  GraduationCap,
  DollarSign,
  HardHat,
  Settings,
  ShoppingBag,
  Hotel
} from 'lucide-react'
import CategoryGrid from '@/components/CategoryGrid'
import TestimonialCarousel from '@/components/TestimonialCarousel'

export const metadata: Metadata = {
  title: 'WorkHire — Find Jobs & Hire Top Talent Globally',
  description:
    'WorkHire is the premier AI-powered hiring platform connecting seekers with recruiters worldwide. Post jobs or search opportunities across all industries.',
}

const howItWorks = [
  {
    step: '01',
    icon: Sparkles,
    title: 'Create your profile',
    desc: 'Sign up free and build your profile or list your business. Upload your resume or details to stand out to employers and candidates.',
  },
  {
    step: '02',
    icon: Briefcase,
    title: 'Browse & post opportunities',
    desc: 'Recruiters can list open positions in minutes. Seekers can search thousands of openings with granular filters for location and salary.',
  },
  {
    step: '03',
    icon: MessageSquare,
    title: 'Direct real-time chat',
    desc: 'Message hiring managers or top talent directly. Avoid black-hole forms, coordinate interviews, and track status live.',
  },
]

type LandingRecentJob = {
  _id: { toString: () => string }
  title: string
  type: string
  location?: string
  salary?: { min?: number; currency?: string }
  companyId?: { name?: string; industry?: string }
}

export default async function LandingPage() {
  await connectDB()

  const [totalJobs, totalCompanies, totalUsers] = await Promise.all([
    Job.countDocuments({ status: 'active' }),
    Company.countDocuments({ isAdminApproved: true }),
    User.countDocuments({ role: 'jobseeker' }),
  ])

  const recentJobs = await Job.find({ status: 'active' })
    .populate('companyId', 'name industry')
    .sort({ createdAt: -1 })
    .limit(6)
    .lean()
  const typedRecentJobs = recentJobs as unknown as LandingRecentJob[]

  return (
    <div className="min-h-screen bg-[#fafbff] selection:bg-primary/20 selection:text-primary relative overflow-hidden flex flex-col justify-between" style={{ fontFamily: 'Geist, sans-serif' }}>
      
      {/* ── Background Blobs ── */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none -mr-48 -mt-48" />
      <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl pointer-events-none -ml-48" />
      <div className="absolute bottom-20 right-10 w-[350px] h-[350px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* ── NAVBAR ── */}
      <LandingHeader />

      {/* ── HERO ── */}
      <section className="relative py-24 px-6 md:px-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Hero Content */}
        <div className="lg:col-span-7 space-y-8 text-center lg:text-left animate-slide-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4.5 py-1.5 mx-auto lg:mx-0">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-primary text-xs font-semibold uppercase tracking-wider">AI-Powered Global Hiring Platform</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]" style={{ letterSpacing: '-0.02em' }}>
            Connecting Global Talent <br />
            with <span className="text-gradient-primary">Elite Recruiters</span>
          </h1>

          <p className="text-muted text-base md:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
            Find your dream role or scale your team worldwide. WorkHire utilizes AI matching and real-time direct chat to streamline hiring across all industries.
          </p>

          {/* Search bar */}
          <form action="/jobs" className="flex flex-col sm:flex-row gap-2.5 max-w-2xl mx-auto lg:mx-0 p-2.5 bg-white border border-border/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
            <div className="flex-1 flex items-center gap-2 px-3">
              <Briefcase className="w-4 h-4 text-muted/60 shrink-0" />
              <input
                type="text"
                name="search"
                placeholder="Job title, skill, or role..."
                className="w-full py-2.5 text-sm bg-transparent text-foreground placeholder:text-muted/50 focus:outline-none"
              />
            </div>
            <div className="sm:w-44 flex items-center gap-2 px-3 border-t sm:border-t-0 sm:border-l border-border/50 py-2.5 sm:py-0">
              <MapPin className="w-4 h-4 text-muted/60 shrink-0" />
              <input
                type="text"
                name="location"
                placeholder="Remote, city, country..."
                className="w-full py-1 text-sm bg-transparent text-foreground placeholder:text-muted/50 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="btn-premium-primary px-8 py-3.5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Search Jobs
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Popular searches */}
          <div className="flex flex-wrap justify-center lg:justify-start items-center gap-2.5 pt-2">
            <span className="text-muted text-xs font-semibold">Popular:</span>
            {[
              'Software Developer', 'Project Manager', 'Nurse', 'Teacher', 'Sales Executive', 'Accountant'
            ].map(term => (
              <Link
                key={term}
                href={`/jobs?search=${term}`}
                className="text-xs text-muted hover:text-primary px-3 py-1.5 rounded-xl bg-white border border-border/60 hover:border-primary/20 transition-all font-medium"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>

        {/* Hero Showcase Mockup */}
        <div className="lg:col-span-5 flex justify-center animate-float">
          <div className="w-full max-w-[450px] bg-white rounded-3xl border border-border/90 shadow-[0_20px_50px_rgba(79,70,229,0.05)] p-6 relative">
            {/* Float Card 1 */}
            <div className="absolute -top-6 -right-4 w-40 bg-white/95 backdrop-blur-md rounded-2xl border border-primary/10 shadow-lg p-4 animate-float-delayed z-20">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-bold text-muted uppercase tracking-wider">Hiring Live</span>
              </div>
              <p className="text-xs font-bold text-foreground">Global Health Corp</p>
              <p className="text-[10px] text-muted font-medium">Verified Recruiter</p>
            </div>

            {/* Float Card 2 */}
            <div className="absolute -bottom-6 -left-4 w-44 bg-white/95 backdrop-blur-md rounded-2xl border border-accent/10 shadow-lg p-4 z-20">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-bold text-foreground">Resume Score</span>
                <span className="text-[10px] font-extrabold text-accent">96%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-accent w-[96%] rounded-full" />
              </div>
              <p className="text-[9px] text-muted/80 mt-1.5 font-medium">Highly competitive profile</p>
            </div>

            {/* Mockup Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="px-3 py-0.5 rounded-lg bg-slate-50 text-[9px] text-muted/80 font-bold border border-border/30">
                workhire.com/dashboard
              </div>
            </div>

            {/* Mockup Content */}
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-50/50 border border-slate-100 rounded-xl p-3">
                <div>
                  <h4 className="text-xs font-bold text-foreground">Talent Hub</h4>
                  <p className="text-[9px] text-muted">Global inclusive job platform</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shadow-sm">
                  W
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 text-center">
                  <span className="text-xl">👩‍🏫</span>
                  <p className="text-xs font-bold text-foreground mt-1">Education</p>
                  <p className="text-[9px] text-muted">Verified roles</p>
                </div>
                <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 text-center">
                  <span className="text-xl">👩‍⚕️</span>
                  <p className="text-xs font-bold text-foreground mt-1">Healthcare</p>
                  <p className="text-[9px] text-muted">Global openings</p>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Live Applications</p>
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-border/40 bg-white shadow-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/5">
                      S
                    </div>
                    <div>
                      <p className="text-[10px] font-bold">Stellar Academy</p>
                      <p className="text-[8px] text-muted">Science Educator · London</p>
                    </div>
                  </div>
                  <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wider">
                    Offered
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS SECTION ── */}
      <section className="bg-white border-y border-border/80 py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-3 gap-6 md:gap-12 text-center">
            {[
              { value: `${totalJobs.toLocaleString()}+`, label: 'Active Vacancies', desc: 'verified opportunities' },
              { value: `${totalCompanies.toLocaleString()}+`, label: 'Registered Recruiters', desc: 'actively hiring' },
              { value: `${totalUsers.toLocaleString()}+`, label: 'Talent Pool', desc: 'registered seekers' },
            ].map(({ value, label, desc }) => (
              <div key={label} className="space-y-1">
                <p className="text-2xl md:text-4xl font-extrabold text-[#3525cd] tracking-tight">{value}</p>
                <p className="text-xs md:text-sm font-bold text-foreground">{label}</p>
                <p className="text-[10px] text-muted hidden md:block">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── JOB CATEGORIES ── */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-primary text-xs font-bold uppercase tracking-wider">Explore Options</span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Browse Opportunities Globally
          </h2>
          <p className="text-muted text-sm md:text-base leading-relaxed">
            From classroom instruction and medical care to engineering projects and executive offices — find or list the perfect role.
          </p>
        </div>

        <CategoryGrid />

        <div className="text-center mt-10">
          <Link
            href="/jobs"
            className="btn-premium-secondary inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-foreground text-sm font-bold transition-all active:scale-[0.98]"
          >
            Browse All Jobs
            <ArrowRight className="w-4 h-4 text-primary" />
          </Link>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 px-6 bg-white border-y border-border/80">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-primary text-xs font-bold uppercase tracking-wider">Simple Process</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Streamlined For Both Sides
            </h2>
            <p className="text-muted text-sm md:text-base leading-relaxed">
              Designed to connect recruiters and job seekers transparently with minimum friction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="premium-card p-8 rounded-3xl relative overflow-hidden group hover:border-primary/20">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full pointer-events-none" />
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/15 uppercase tracking-wider">
                  Step {step}
                </span>
                
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary mt-6 mb-5 group-hover:scale-105 transition-transform shadow-xs">
                  <Icon className="w-6 h-6" />
                </div>
                
                <h3 className="font-bold text-foreground text-base mb-2">{title}</h3>
                <p className="text-xs text-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RECENT JOBS ── */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div className="space-y-2">
            <span className="text-primary text-xs font-bold uppercase tracking-wider">Latest Additions</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Latest Openings
            </h2>
            <p className="text-muted text-sm">Fresh vacancies added globally by verified recruiters</p>
          </div>
          <Link 
            href="/jobs" 
            className="text-xs font-bold text-primary hover:text-primary-dark flex items-center gap-1 transition-colors"
          >
            View all jobs
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {typedRecentJobs.map(job => {
            const isINR = (job.salary?.currency || 'INR') === 'INR'
            const symbol = isINR ? '₹' : '$'
            const salaryText = job.salary?.min 
              ? isINR 
                ? `${symbol}${(job.salary.min / 100000).toFixed(1)}L+`
                : `${symbol}${(job.salary.min / 1000).toFixed(0)}k+`
              : null

            return (
              <Link
                key={job._id.toString()}
                href={`/jobs/${job._id}`}
                className="premium-card p-6 rounded-3xl hover:border-primary/20 hover:shadow-[0_8px_25px_rgba(79,70,229,0.03)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-3.5 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-50 to-primary/5 border border-primary/10 flex items-center justify-center text-primary font-bold text-base shrink-0">
                      {job.companyId?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-foreground text-sm leading-snug truncate hover:text-primary transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-xs text-muted truncate mt-0.5">{job.companyId?.name}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/15 uppercase tracking-wider">
                      {job.type}
                    </span>
                    {job.location && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-100 text-muted uppercase tracking-wider flex items-center gap-1">
                        📍 {job.location}
                      </span>
                    )}
                    {salaryText && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                        💰 {salaryText}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-muted">
                  <span className="capitalize">{job.companyId?.industry || 'General'}</span>
                  <span className="text-primary hover:underline flex items-center gap-0.5">
                    Apply Now
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ── AI FEATURES ── */}
      <section className="py-20 px-6 bg-white border-y border-border/80 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mx-auto">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span className="text-accent text-xs font-semibold uppercase tracking-wider">Dual-Sided Smart Tools</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Powerful Features For Both Sides
            </h2>
            <p className="text-muted text-sm md:text-base leading-relaxed">
              Equipping candidates to stand out and enabling recruiters to select the ideal matches quickly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: 'AI Cover Letter Helper (Seekers)',
                desc: 'Generate tailored cover letters immediately for any job listing. Supports all roles, from engineering to hospitality.',
                color: 'bg-primary/10 text-primary border-primary/20',
              },
              {
                icon: BarChart3,
                title: 'AI Matching & Sorting (Recruiters)',
                desc: 'Automatically screens resumes against specifications, indexing and ranking profiles so you focus on the best.',
                color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
              },
              {
                icon: MessageSquare,
                title: 'Real-Time Direct Chat (Shared)',
                desc: 'Connect immediately. Skip email delay and cold messages with our secure web communication console.',
                color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
              },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="premium-card p-8 rounded-3xl bg-white hover:border-primary/20">
                <div className={`w-12 h-12 rounded-2xl ${color} border flex items-center justify-center mb-5`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-foreground text-base mb-2">{title}</h3>
                <p className="text-xs text-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-primary text-xs font-bold uppercase tracking-wider">Success Stories</span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Trusted by Professionals & Employers
          </h2>
          <p className="text-muted text-sm md:text-base leading-relaxed">
            See how recruiters and job seekers alike are finding value on our global portal.
          </p>
        </div>

        <TestimonialCarousel />
      </section>

      {/* ── FOR COMPANIES ── */}
      <section className="py-24 px-6 bg-slate-950 border-t border-slate-900 text-white relative overflow-hidden">
        {/* Neon Radial Backdrops */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Block: Features */}
          <div className="lg:col-span-7 space-y-8 animate-slide-up">
            <div className="inline-flex items-center gap-2.5 bg-white/[0.04] border border-white/[0.08] backdrop-blur-md rounded-full px-4.5 py-1.5 shadow-inner">
              <Building className="w-3.5 h-3.5 text-primary-light" />
              <span className="text-white/90 text-xs font-bold uppercase tracking-wider">For Employers</span>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Hire the Right Talent <br />
                <span className="text-gradient-purple font-black">For Any Role</span>
              </h2>
              <p className="text-white/50 text-sm md:text-base leading-relaxed max-w-xl">
                Post jobs across any industry globally. Sourced applications are verified, categorized, and analyzed with AI ranking to identify the best candidates instantly.
              </p>
            </div>

            {/* Premium Mini-Cards list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: Sparkles, text: 'AI-powered candidate ranking', color: 'text-indigo-400 bg-indigo-500/10' },
                { icon: ShieldCheck, text: 'Fully verified seeker accounts', color: 'text-emerald-400 bg-emerald-500/10' },
                { icon: MessageSquare, text: 'Direct messaging chat console', color: 'text-cyan-400 bg-cyan-500/10' },
                { icon: BarChart3, text: 'Hiring analytics dashboard', color: 'text-purple-400 bg-purple-500/10' },
                { icon: CheckCircle2, text: 'Start free — 3 job posts included', color: 'text-amber-400 bg-amber-500/10' },
              ].map(({ icon: Icon, text, color }, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] hover:border-white/[0.08] transition-all duration-300 group"
                >
                  <div className={`w-8.5 h-8.5 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-white/80 group-hover:text-white transition-colors">{text}</span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Link
                href="/register?type=recruiter"
                className="btn-premium-primary inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white text-sm font-bold shadow-lg shadow-primary/20 active:scale-[0.98]"
              >
                Post a Job Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Block: Interactive Industry Grid */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            {[
              { icon: HeartPulse, label: 'Healthcare', desc: 'Hospitals & Medical', color: 'group-hover:text-rose-400', glow: 'hover:shadow-[0_0_25px_rgba(244,63,94,0.12)] hover:border-rose-500/25' },
              { icon: GraduationCap, label: 'Education', desc: 'Schools & Academies', color: 'group-hover:text-amber-400', glow: 'hover:shadow-[0_0_25px_rgba(245,158,11,0.12)] hover:border-amber-500/25' },
              { icon: DollarSign, label: 'Finance', desc: 'Banking & Accounts', color: 'group-hover:text-emerald-400', glow: 'hover:shadow-[0_0_25px_rgba(16,185,129,0.12)] hover:border-emerald-500/25' },
              { icon: HardHat, label: 'Engineering', desc: 'Build & Construct', color: 'group-hover:text-indigo-400', glow: 'hover:shadow-[0_0_25px_rgba(99,102,241,0.12)] hover:border-indigo-500/25' },
              { icon: Settings, label: 'Manufacturing', desc: 'Factories & Ops', color: 'group-hover:text-cyan-400', glow: 'hover:shadow-[0_0_25px_rgba(6,182,212,0.12)] hover:border-cyan-500/25' },
              { icon: ShoppingBag, label: 'Retail', desc: 'Commerce & Sales', color: 'group-hover:text-fuchsia-400', glow: 'hover:shadow-[0_0_25px_rgba(217,70,239,0.12)] hover:border-fuchsia-500/25' },
              { icon: Hotel, label: 'Hospitality', desc: 'Hotels & Tourism', color: 'group-hover:text-orange-400', glow: 'hover:shadow-[0_0_25px_rgba(249,115,22,0.12)] hover:border-orange-500/25' },
              { icon: Globe, label: 'All Industries', desc: 'Any professional sector', color: 'group-hover:text-sky-400', glow: 'hover:shadow-[0_0_25px_rgba(14,165,233,0.12)] hover:border-sky-500/25' },
            ].map(({ icon: Icon, label, desc, color, glow }) => (
              <div 
                key={label} 
                className={`bg-white/[0.02] border border-white/[0.04] rounded-2xl p-5 text-left transition-all duration-300 group cursor-pointer ${glow}`}
              >
                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4 transition-colors duration-300 group-hover:bg-white/[0.08]">
                  <Icon className={`w-5 h-5 text-white/50 transition-colors duration-300 ${color}`} />
                </div>
                <h4 className="text-sm font-bold text-white tracking-tight group-hover:text-white transition-colors">{label}</h4>
                <p className="text-[10px] text-white/40 mt-1 font-semibold group-hover:text-white/55 transition-colors">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#3525cd] via-[#4338ca] to-[#3525cd] text-center text-white relative">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Ready to get started?
          </h2>
          <p className="text-white/75 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
            Join thousands of professionals and hiring companies who connect on WorkHire. Free for candidates. Affordable plans for recruiters.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3.5 justify-center pt-4">
            <Link
              href="/register"
              className="px-8 py-4 rounded-xl bg-white text-[#3525cd] text-sm font-bold hover:bg-slate-50 transition-colors shadow-lg active:scale-[0.98]"
            >
              Create Free Account
            </Link>
            <Link
              href="/jobs"
              className="px-8 py-4 rounded-xl border border-white/30 text-white text-sm font-semibold hover:bg-white/10 transition-colors active:scale-[0.98]"
            >
              Browse Openings
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-white border-t border-border/80 py-16 px-6">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            
            <div className="col-span-2 md:col-span-1 space-y-4">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">WorkHire</span>
              <p className="text-xs text-muted leading-relaxed">
                Global AI-powered job portal for every profession. Find jobs, hire talent, connect instantly.
              </p>
            </div>

            <div className="space-y-3.5">
              <p className="text-xs font-extrabold text-foreground uppercase tracking-wider">For Job Seekers</p>
              <div className="space-y-2">
                {[
                  { href: '/jobs',     label: 'Browse Jobs'   },
                  { href: '/register', label: 'Create Account'},
                  { href: '/login',    label: 'Login'         },
                ].map(({ href, label }) => (
                  <Link key={href} href={href} className="block text-xs text-muted hover:text-primary transition-colors font-medium">
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-3.5">
              <p className="text-xs font-extrabold text-foreground uppercase tracking-wider">For Employers</p>
              <div className="space-y-2">
                {[
                  { href: '/register?type=recruiter', label: 'Post a Job'   },
                  { href: '/login',                   label: 'Recruiter Login'},
                ].map(({ href, label }) => (
                  <Link key={label} href={href} className="block text-xs text-muted hover:text-primary transition-colors font-medium">
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-3.5">
              <p className="text-xs font-extrabold text-foreground uppercase tracking-wider">Company</p>
              <div className="space-y-2">
                {[
                  { href: '/about',   label: 'About Us'      },
                  { href: '/contact', label: 'Contact'       },
                  { href: '/privacy', label: 'Privacy Policy'},
                  { href: '/terms',   label: 'Terms of Use'  },
                ].map(({ href, label }) => (
                  <Link key={href} href={href} className="block text-xs text-muted hover:text-primary transition-colors font-medium">
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted font-medium">
            <p>© 2026 WorkHire. All rights reserved.</p>
            <p>
              Made with ❤️ for recruiters & seekers globally · <span className="text-primary font-bold">workhire.com</span>
            </p>
          </div>
        </div>
      </footer>

    </div>
  )
}
