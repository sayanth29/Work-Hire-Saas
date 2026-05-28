'use client'

import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'

const testimonials = [
  {
    name:    'Priya Menon',
    role:    'Staff Nurse',
    company: 'Apollo Health',
    avatar:  'P',
    color:   'from-pink-500 to-rose-600',
    quote:   'Found my dream nursing job within 2 weeks. The process was so simple and the AI helped me write an excellent cover letter!',
  },
  {
    name:    'David Miller',
    role:    'Engineering Director',
    company: 'TechCorp Solutions',
    avatar:  'D',
    color:   'from-blue-500 to-indigo-600',
    quote:   'Hiring was incredibly smooth. We sourced a Senior Backend Developer within 10 days. Direct chat saved us hours of back-and-forth email.',
  },
  {
    name:    'Anjali Nair',
    role:    'School Teacher',
    company: 'EduLearn Academy',
    avatar:  'A',
    color:   'from-emerald-500 to-teal-600',
    quote:   'Finally, a job portal that lists diverse teaching roles! The AI resume analyzer helped me polish my profile before applying.',
  },
  {
    name:    'Sarah Jenkins',
    role:    'Talent Acquisition Lead',
    company: 'Veloce Global',
    avatar:  'S',
    color:   'from-orange-500 to-amber-600',
    quote:   "WorkHire's matching algorithm parses resumes and ranks candidates automatically, making screening five times faster.",
  },
]

export default function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative w-full overflow-hidden py-4">
      {/* Testimonials Track */}
      <div 
        className="flex transition-transform duration-700 ease-in-out"
        style={{
          transform: `translate3d(-${currentIndex * 100}%, 0, 0)`,
        }}
      >
        {testimonials.map(({ name, role, company, avatar, color, quote }) => (
          <div key={name} className="w-full shrink-0 px-4">
            <div className="max-w-2xl mx-auto premium-card p-8 rounded-3xl bg-white border border-border flex flex-col justify-between hover:border-primary/20 transition-all duration-300 min-h-[220px]">
              <div className="space-y-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs md:text-sm text-muted leading-relaxed font-semibold italic">
                  "{quote}"
                </p>
              </div>

              <div className="flex items-center gap-3.5 mt-6 pt-4 border-t border-slate-100">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-extrabold text-sm shrink-0 shadow-sm`}>
                  {avatar}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">{name}</p>
                  <p className="text-[10px] text-muted truncate">{role}</p>
                  <p className="text-[9px] text-primary font-bold truncate">{company}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-6">
        {testimonials.map((_, index) => (
          <button
            key={index}
            type="button"
            suppressHydrationWarning={true}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer
              ${currentIndex === index ? 'bg-[#3525cd] w-5' : 'bg-slate-200 hover:bg-slate-300'}`}
          />
        ))}
      </div>
    </div>
  )
}
