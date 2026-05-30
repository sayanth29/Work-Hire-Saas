// 📄 PAGE: Contact Us
// 🌐 URL: /contact
// 👤 WHO: Public (everyone)

import Link from 'next/link'
import type { Metadata } from 'next'
import LandingHeader from '@/components/LandingHeader'
import ContactForm from '@/components/ContactForm'
import { 
  Mail, 
  MapPin, 
  Clock, 
  MessageSquare,
  Sparkles,
  Heart
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact Us — Support & Inquiries | WorkHire',
  description: 'Have questions? Get in touch with WorkHire support. Reach out at workhire@gmail.com or visit our HQ in Kannur, Kerala.',
}

export default function ContactPage() {
  const contactDetails = [
    {
      icon: Mail,
      label: 'Email Inquiries',
      value: 'workhire@gmail.com',
      desc: 'Our support team responds within 24 hours.',
      color: 'text-indigo-500 bg-indigo-50/50 border-indigo-100'
    },
    {
      icon: MapPin,
      label: 'Global Headquarters',
      value: 'Kannur, Kerala, India',
      desc: 'Located in the tech & cultural hub of North Malabar.',
      color: 'text-emerald-500 bg-emerald-50/50 border-emerald-100'
    },
    {
      icon: Clock,
      label: 'Operational Hours',
      value: 'Monday – Friday',
      desc: '9:00 AM – 6:00 PM (IST). Closed on weekends.',
      color: 'text-amber-500 bg-amber-50/50 border-amber-100'
    }
  ]

  return (
    <div className="min-h-screen bg-[#fafbff] selection:bg-primary/20 selection:text-primary relative overflow-hidden flex flex-col justify-between" style={{ fontFamily: 'Geist, sans-serif' }}>
      
      {/* Background radial blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -mr-48 -mt-48" />
      <div className="absolute bottom-20 left-0 w-[450px] h-[450px] bg-accent/5 rounded-full blur-[100px] pointer-events-none -ml-48" />

      <LandingHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-16 md:py-24 relative z-10 space-y-16">
        
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto space-y-4 animate-slide-up">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-primary" />
            <span className="text-primary text-xs font-semibold uppercase tracking-wider">Get In Touch</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">
            How Can We <span className="text-gradient-primary font-black">Help You?</span>
          </h1>
          <p className="text-muted text-xs md:text-sm leading-relaxed">
            Have queries regarding user accounts, subscriptions, or partnership opportunities? Reach out and we will help you find solutions.
          </p>
        </div>

        {/* Contact details + form grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-5xl mx-auto">
          
          {/* Details column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-4">
              <h3 className="text-base font-extrabold text-foreground tracking-tight">Contact Information</h3>
              <p className="text-muted text-xs leading-relaxed">
                Connect with our team through email or locate our operational base in Kannur.
              </p>
            </div>

            <div className="space-y-4">
              {contactDetails.map(({ icon: Icon, label, value, desc, color }) => (
                <div key={label} className="premium-card p-5 rounded-2xl flex gap-4 items-start hover:border-primary/20">
                  <div className={`w-9 h-9 rounded-xl ${color} border flex items-center justify-center shrink-0`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-extrabold text-muted uppercase tracking-wider">{label}</p>
                    <p className="text-xs font-extrabold text-foreground">{value}</p>
                    <p className="text-[10px] text-muted">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Feature Callout card */}
            <div className="premium-card p-6 rounded-2xl bg-gradient-to-br from-indigo-50/50 to-primary/5 border-primary/10 flex gap-3 items-start">
              <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-foreground">Immediate Support</h4>
                <p className="text-[10px] text-muted leading-relaxed mt-1">
                  Registered users can access their dashboard to start live chats directly with hiring managers or search support tickets.
                </p>
              </div>
            </div>
          </div>

          {/* Form column */}
          <div className="lg:col-span-7">
            <ContactForm />
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
            <p className="flex items-center gap-1">
              Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline mx-0.5" /> for recruiters & seekers globally · <span className="text-primary font-bold">workhire.com</span>
            </p>
          </div>
        </div>
      </footer>

    </div>
  )
}
