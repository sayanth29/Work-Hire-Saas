// 📄 PAGE: About Us
// 🌐 URL: /about
// 👤 WHO: Public (everyone)

import Link from 'next/link'
import type { Metadata } from 'next'
import LandingHeader from '@/components/LandingHeader'
import { 
  Compass, 
  Eye, 
  ShieldCheck, 
  Users, 
  Globe, 
  MapPin, 
  Heart,
  ArrowRight
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Us — Our Vision & Journey | WorkHire',
  description: 'Learn about WorkHire, our mission to bridge global talent and recruiters, and how our journey started in Kannur, Kerala.',
}

export default function AboutPage() {
  const values = [
    {
      icon: Compass,
      title: 'Inclusivity',
      desc: 'Connecting professionals from all walks of life — healthcare, engineering, teaching, hospitality, and beyond.',
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20'
    },
    {
      icon: Eye,
      title: 'Transparency',
      desc: 'Direct communication channels between recruiters and seekers. Say goodbye to black-hole job applications.',
      color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20'
    },
    {
      icon: ShieldCheck,
      title: 'Verification',
      desc: 'All company listings are vetted by administrators to protect job seekers from ghost jobs and fake openings.',
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
    }
  ]

  return (
    <div className="min-h-screen bg-[#fafbff] selection:bg-primary/20 selection:text-primary relative overflow-hidden flex flex-col justify-between" style={{ fontFamily: 'Geist, sans-serif' }}>
      
      {/* Background radial blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -mr-48 -mt-48" />
      <div className="absolute bottom-20 left-0 w-[450px] h-[450px] bg-accent/5 rounded-full blur-[100px] pointer-events-none -ml-48" />

      <LandingHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-16 md:py-24 relative z-10 space-y-24">
        
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-6 animate-slide-up">
          <div className="inline-flex items-center gap-2.5 bg-primary/10 border border-primary/20 rounded-full px-4.5 py-1.5 shadow-xs">
            <Heart className="w-3.5 h-3.5 text-primary" />
            <span className="text-primary text-xs font-semibold uppercase tracking-wider">Our Story</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]" style={{ letterSpacing: '-0.02em' }}>
            Reimagining Hiring <br />
            <span className="text-gradient-primary font-black">For Everyone</span>
          </h1>

          <p className="text-muted text-base md:text-lg leading-relaxed">
            WorkHire is a global AI-powered job platform designed to bring candidates and employers together in direct real-time communication, removing the complexity of recruitment.
          </p>
        </section>

        {/* Stats segment */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          {[
            { label: 'Platform Users', value: '50,000+', desc: 'Active job seekers and recruiters' },
            { label: 'Jobs Listed', value: '12,000+', desc: 'Verified openings worldwide' },
            { label: 'Hiring Speed', value: '5x Faster', desc: 'Through direct real-time chat' }
          ].map(({ label, value, desc }) => (
            <div key={label} className="premium-card p-8 rounded-3xl hover:border-primary/25 transition-all">
              <p className="text-3xl md:text-5xl font-black text-primary tracking-tight">{value}</p>
              <h3 className="text-sm font-bold text-foreground mt-3 uppercase tracking-wider">{label}</h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">{desc}</p>
            </div>
          ))}
        </section>

        {/* Our Mission / Core Values */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight leading-tight">
              Driven by Values, <br />
              Focused on Connects
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              We believe that recruitment should not be an endless cycle of automated rejection emails. Our platform is built on direct communication, enabling seekers and hiring managers to interact, align, and finalize decisions seamlessly.
            </p>
            <div className="pt-2">
              <Link 
                href="/jobs" 
                className="btn-premium-primary inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-white text-sm font-bold shadow-md shadow-primary/10 hover:shadow-primary/20"
              >
                Browse Careers
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {values.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="premium-card p-6 rounded-3xl hover:shadow-[0_8px_30px_rgba(79,70,229,0.02)]">
                <div className={`w-10 h-10 rounded-xl ${color} border flex items-center justify-center mb-5`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-foreground text-sm mb-2">{title}</h4>
                <p className="text-[11px] text-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Kannur, Kerala Roots Segment */}
        <section className="premium-card p-8 md:p-12 rounded-3xl bg-slate-900 border-slate-800 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none -mr-32 -mb-32" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-5">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1">
                <MapPin className="w-3.5 h-3.5 text-primary-light" />
                <span className="text-white/80 text-xs font-semibold">From Kannur, Kerala to the World</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-extrabold text-white leading-tight">
                Rooted in Kerala, Building Globally
              </h2>
              <p className="text-white/60 text-xs md:text-sm leading-relaxed max-w-xl">
                WorkHire was conceived in Kannur, Kerala, India — a region renowned for its vibrant culture, high literacy, and ambitious professionals. Seeing local nurses, teachers, and engineers navigate complicated recruitment hurdles, we built a tool to connect them directly to international opportunities. Today, our reach spans continents, yet we remain proud of our coastal origin.
              </p>
            </div>

            <div className="lg:col-span-4 flex justify-center">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center max-w-[240px]">
                <Globe className="w-12 h-12 text-primary-light mx-auto mb-4 animate-pulse-glow" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Kannur, Kerala</h4>
                <p className="text-[10px] text-white/50 mt-1 font-semibold">HQ Operations</p>
              </div>
            </div>
          </div>
        </section>

      </main>

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
