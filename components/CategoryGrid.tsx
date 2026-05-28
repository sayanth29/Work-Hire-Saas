'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Laptop, 
  HeartPulse, 
  GraduationCap, 
  Megaphone, 
  TrendingUp, 
  DollarSign, 
  Palette, 
  Settings, 
  Users, 
  Hotel, 
  Truck, 
  Scale, 
  Headphones, 
  HardHat, 
  ShoppingBag, 
  Camera,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

const categories = [
  { icon: Laptop,         label: 'Technology',       slug: 'technology'       },
  { icon: HeartPulse,     label: 'Healthcare',       slug: 'healthcare'       },
  { icon: GraduationCap,  label: 'Education',        slug: 'education'        },
  { icon: Megaphone,      label: 'Marketing',        slug: 'marketing'        },
  { icon: TrendingUp,     label: 'Sales',            slug: 'sales'            },
  { icon: DollarSign,     label: 'Finance',          slug: 'finance'          },
  { icon: Palette,        label: 'Design',           slug: 'design'           },
  { icon: Settings,       label: 'Engineering',      slug: 'engineering'      },
  { icon: Users,          label: 'Human Resources',  slug: 'hr'               },
  { icon: Hotel,          label: 'Hospitality',      slug: 'hospitality'      },
  { icon: Truck,          label: 'Logistics',        slug: 'logistics'        },
  { icon: Scale,          label: 'Legal',            slug: 'legal'            },
  { icon: Headphones,     label: 'Customer Support', slug: 'customer-support' },
  { icon: HardHat,        label: 'Construction',     slug: 'construction'     },
  { icon: ShoppingBag,    label: 'Retail',           slug: 'retail'           },
  { icon: Camera,         label: 'Media',            slug: 'media'            },
]

export default function CategoryGrid() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {categories.map(({ icon: Icon, label, slug }, index) => {
          const isHiddenOnMobile = index >= 12 && !isExpanded
          return (
            <Link
              key={slug}
              href={`/jobs?category=${slug}`}
              className={`flex items-center gap-3.5 p-4 rounded-2xl border border-border bg-white hover:border-primary/20 hover:bg-slate-50/50 hover:shadow-[0_4px_16px_rgba(79,70,229,0.015)] transition-all duration-300 group
                ${isHiddenOnMobile ? 'hidden sm:flex' : 'flex'}`}
            >
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-border group-hover:bg-primary/5 group-hover:border-primary/10 flex items-center justify-center transition-colors">
                <Icon className="w-5 h-5 text-muted group-hover:text-primary transition-colors" />
              </div>
              <span className="text-xs md:text-sm font-bold text-[#464555] group-hover:text-primary transition-colors truncate">
                {label}
              </span>
            </Link>
          )
        })}
      </div>

      {/* Mobile "More Options" toggle button */}
      <div className="text-center sm:hidden">
        <button
          type="button"
          suppressHydrationWarning={true}
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-[#c7c4d8] bg-white hover:bg-slate-50 text-[#464555] text-xs font-bold transition-all active:scale-[0.98] shadow-sm cursor-pointer"
        >
          {isExpanded ? (
            <>
              Show Less <ChevronUp className="w-3.5 h-3.5 text-primary" />
            </>
          ) : (
            <>
              More Options <ChevronDown className="w-3.5 h-3.5 text-primary" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
