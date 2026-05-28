// 📄 PAGE: Terms of Use
// 🌐 URL: /terms
// 👤 WHO: Public (everyone)

import Link from 'next/link'
import type { Metadata } from 'next'
import LandingHeader from '@/components/LandingHeader'
import { FileText, Award, Gavel, Scale, CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Use — Platform Guidelines | WorkHire',
  description: 'Review the terms and conditions for using the WorkHire hiring platform. Guidelines for both job seekers and recruiters.',
}

export default function TermsPage() {
  const sections = [
    { id: 'acceptance', title: '1. Acceptance of Terms' },
    { id: 'conduct',    title: '2. User Conduct Guidelines' },
    { id: 'recruiters', title: '3. Recruiter Subscription Terms' },
    { id: 'seekers',    title: '4. Candidate Profile Rules' },
    { id: 'liability font-bold',title: '5. Limitation of Liability' },
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
            <Gavel className="w-3.5 h-3.5 text-primary" />
            <span className="text-primary text-xs font-semibold uppercase tracking-wider">Legal Framework</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Terms of Use
          </h1>
          <p className="text-muted text-xs md:text-sm">
            Last Updated: May 2026. General terms governing access and interaction guidelines.
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
              <Scale className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-foreground">Usage Rights</h4>
                <p className="text-[10px] text-muted leading-relaxed mt-1">
                  We enforce compliance to protect candidates from recruitment fraud and maintain a premium hiring standard.
                </p>
              </div>
            </div>
          </aside>

          {/* Terms content (Right) */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Section 1 */}
            <section id="acceptance" className="space-y-4 scroll-mt-28">
              <div className="border-l-2 border-primary pl-4">
                <h2 className="text-base font-extrabold text-foreground">1. Acceptance of Terms</h2>
              </div>
              <p className="text-muted text-xs leading-relaxed">
                By creating an account, posting a job listing, or submitting an application on WorkHire, you agree to be bound by these Terms of Use and our Privacy Policy. If you do not accept these guidelines, you may not register or access platform services.
              </p>
            </section>

            {/* Section 2 */}
            <section id="conduct" className="space-y-4 scroll-mt-28">
              <div className="border-l-2 border-primary pl-4">
                <h2 className="text-base font-extrabold text-foreground">2. User Conduct Guidelines</h2>
              </div>
              <p className="text-muted text-xs leading-relaxed font-semibold">
                All registered candidates and employers agree to interact with professional courtesy. The following behaviors are strictly prohibited:
              </p>
              <ul className="space-y-2.5">
                {[
                  'Posting inaccurate, fraudulent, or deceptive listing information.',
                  'Sending harassing, abusive, or spam messages via the direct chat console.',
                  'Impersonating another person or corporate entity.',
                  'Employing automated parsers, scraping programs, or bots to crawl database profiles.'
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-2.5 items-start text-xs text-muted leading-relaxed">
                    <CheckCircle2 className="w-4.5 h-4.5 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Section 3 */}
            <section id="recruiters" className="space-y-4 scroll-mt-28">
              <div className="border-l-2 border-primary pl-4">
                <h2 className="text-base font-extrabold text-foreground">3. Recruiter Subscription Terms</h2>
              </div>
              <p className="text-muted text-xs leading-relaxed">
                Recruiters upgrading to Pro or Enterprise subscriptions must comply with our payment protocols:
              </p>
              <ul className="space-y-2.5">
                {[
                  'Transactions: Upgrades are processed securely using Razorpay integration.',
                  'Approvals: Upgraded companies must undergo manual admin verification before posting vacancies.',
                  'Billing Ends: Subscription limits are reset monthly. Cancellations take effect at the end of the current billing cycle.'
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-2.5 items-start text-xs text-muted leading-relaxed">
                    <CheckCircle2 className="w-4.5 h-4.5 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Section 4 */}
            <section id="seekers" className="space-y-4 scroll-mt-28">
              <div className="border-l-2 border-primary pl-4">
                <h2 className="text-base font-extrabold text-foreground">4. Candidate Profile Rules</h2>
              </div>
              <p className="text-muted text-xs leading-relaxed">
                Candidates must submit accurate educational, professional, and contact parameters. Uploaded resume documents must be free of malicious software, scripts, or viruses. WorkHire reserve the right to remove any profiles displaying fake qualifications or credentials.
              </p>
            </section>

            {/* Section 5 */}
            <section id="liability" className="space-y-4 scroll-mt-28">
              <div className="border-l-2 border-primary pl-4">
                <h2 className="text-base font-extrabold text-foreground">5. Limitation of Liability</h2>
              </div>
              <p className="text-muted text-xs leading-relaxed">
                WorkHire operates as a dynamic portal connecting seekers and recruiters. We do not guarantee candidate placement, recruiter response rates, or work contract outcomes. We are not liable for any direct, indirect, or consequential damages resulting from platform downtime, communication errors, or interactions initiated on our console.
              </p>
              <div className="premium-card p-6 rounded-2xl bg-slate-50 border-slate-100 flex gap-3.5 items-start mt-6">
                <Award className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-foreground">Legal Inquiries</h4>
                  <p className="text-[10px] text-muted leading-relaxed mt-1">
                    For legal questions regarding user agreements or terms definitions, please write to our compliance team at workhire@gmail.com.
                  </p>
                </div>
              </div>
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
