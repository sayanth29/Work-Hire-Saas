// 📄 PAGE: Privacy Policy
// 🌐 URL: /privacy
// 👤 WHO: Public (everyone)

import Link from 'next/link'
import type { Metadata } from 'next'
import LandingHeader from '@/components/LandingHeader'
import { Shield, Lock, FileText, CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy — Data Protection | WorkHire',
  description: 'Understand how WorkHire collects, protects, and uses your personal data. Learn more about your privacy rights.',
}

export default function PrivacyPage() {
  const sections = [
    { id: 'collect', title: '1. Information We Collect' },
    { id: 'use',     title: '2. How We Use Data' },
    { id: 'share',   title: '3. Information Sharing' },
    { id: 'security font-bold',title: '4. Security and Storage' },
    { id: 'rights',  title: '5. Your Privacy Rights' },
  ]

  return (
    <div className="min-h-screen bg-[#fafbff] selection:bg-primary/20 selection:text-primary relative overflow-hidden flex flex-col justify-between" style={{ fontFamily: 'Geist, sans-serif' }}>
      
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -mr-48 -mt-48" />
      <div className="absolute bottom-20 left-0 w-[450px] h-[450px] bg-accent/5 rounded-full blur-[100px] pointer-events-none -ml-48" />

      <LandingHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-16 md:py-24 relative z-10">
        
        {/* Title Block */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16 animate-slide-up">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4.5 py-1.5">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span className="text-primary text-xs font-semibold uppercase tracking-wider">Privacy Center</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-muted text-xs md:text-sm">
            Last Updated: May 2026. Review how we protect and manage your personal records.
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-5xl mx-auto">
          
          {/* Table of contents (Left) */}
          <aside className="lg:col-span-4 sticky top-28 space-y-4 hidden lg:block">
            <div className="premium-card p-6 rounded-3xl space-y-4">
              <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Table of Contents
              </h3>
              <nav className="flex flex-col gap-2">
                {sections.map(({ id, title }) => (
                  <a 
                    key={id}
                    href={`#${id}`} 
                    className="text-xs text-muted hover:text-primary hover:translate-x-1 transition-all font-semibold"
                  >
                    {title}
                  </a>
                ))}
              </nav>
            </div>
            
            <div className="premium-card p-6 rounded-3xl bg-indigo-50/30 border-primary/10 flex gap-3 items-start">
              <Lock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-foreground">Secure Storage</h4>
                <p className="text-[10px] text-muted leading-relaxed mt-1">
                  We use state-of-the-art encryption protocols to safeguard candidate resume uploads and communication databases.
                </p>
              </div>
            </div>
          </aside>

          {/* Policy content (Right) */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Section 1 */}
            <section id="collect" className="space-y-4 scroll-mt-28">
              <div className="border-l-2 border-primary pl-4">
                <h2 className="text-base font-extrabold text-foreground">1. Information We Collect</h2>
              </div>
              <p className="text-muted text-xs leading-relaxed">
                WorkHire collects information necessary to connect seekers with recruiters. This includes:
              </p>
              <ul className="space-y-2.5">
                {[
                  'Personal account details: Name, email address, password, location, phone number.',
                  'Job seeker profile details: Resumes, education history, work experience details, skills.',
                  'Recruiter details: Company profiles, corporate websites, physical address, Razorpay billing details.',
                  'Communication logs: Messages, chat histories, application status logs.'
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-2.5 items-start text-xs text-muted leading-relaxed">
                    <CheckCircle2 className="w-4.5 h-4.5 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Section 2 */}
            <section id="use" className="space-y-4 scroll-mt-28">
              <div className="border-l-2 border-primary pl-4">
                <h2 className="text-base font-extrabold text-foreground">2. How We Use Data</h2>
              </div>
              <p className="text-muted text-xs leading-relaxed">
                We collect your data to build an efficient, secure hiring ecosystem:
              </p>
              <ul className="space-y-2.5">
                {[
                  'Facilitating connections and direct communication between recruiters and seekers.',
                  'Powering our AI matching algorithms to recommend relevant jobs and rank applicants.',
                  'Processing premium recruiter subscriptions safely via secure payment aggregators (Razorpay).',
                  'Sending email verification, security updates, and transaction confirmations.'
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-2.5 items-start text-xs text-muted leading-relaxed">
                    <CheckCircle2 className="w-4.5 h-4.5 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Section 3 */}
            <section id="share" className="space-y-4 scroll-mt-28">
              <div className="border-l-2 border-primary pl-4">
                <h2 className="text-base font-extrabold text-foreground">3. Information Sharing</h2>
              </div>
              <p className="text-muted text-xs leading-relaxed">
                WorkHire does not sell your personal records to third parties. We share information only in the following scenarios:
              </p>
              <ul className="space-y-2.5">
                {[
                  'Candidate profile sharing: When you submit an application, your resume, experience, and contact details are shared directly with the hiring company.',
                  'Service integrations: With secure payment providers (Razorpay) and email delivery networks (Nodemailer) required to process transactions and platform messages.',
                  'Legal requirements: When mandated by legal authorities to comply with court directives or active investigations.'
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-2.5 items-start text-xs text-muted leading-relaxed">
                    <CheckCircle2 className="w-4.5 h-4.5 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Section 4 */}
            <section id="security" className="space-y-4 scroll-mt-28">
              <div className="border-l-2 border-primary pl-4">
                <h2 className="text-base font-extrabold text-foreground">4. Security and Storage</h2>
              </div>
              <p className="text-muted text-xs leading-relaxed">
                Your data is stored securely using cloud infrastructure. We implement administrative and technical safeguards designed to protect personal information from unauthorized access, accidental alteration, or disclosure. Resume uploads are processed through secure file delivery APIs, and database credentials are fully isolated.
              </p>
            </section>

            {/* Section 5 */}
            <section id="rights" className="space-y-4 scroll-mt-28">
              <div className="border-l-2 border-primary pl-4">
                <h2 className="text-base font-extrabold text-foreground">5. Your Privacy Rights</h2>
              </div>
              <p className="text-muted text-xs leading-relaxed font-semibold">
                You possess full control over your platform data. You may exercise the following rights:
              </p>
              <ul className="space-y-2.5">
                {[
                  'Access: Review your profile and transaction details directly in the dashboard.',
                  'Correction: Edit, update, or alter your registration fields at any time.',
                  'Deletion: Request complete deletion of your account (deleting seeker resume documents or company structures).',
                  'Support: Contact our privacy console at workhire@gmail.com for database queries.'
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-2.5 items-start text-xs text-muted leading-relaxed">
                    <CheckCircle2 className="w-4.5 h-4.5 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

          </div>

        </div>

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
