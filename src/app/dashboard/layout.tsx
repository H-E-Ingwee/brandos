'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Sparkles, LayoutDashboard, Target, Palette, TrendingUp,
  MessageSquare, BarChart3, Settings, ChevronRight, Bell,
  LogOut, Menu, X, Zap, Crown, CreditCard, Users
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/supabase/types'
import FloatingAI from '@/components/FloatingAI'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/discovery', icon: Target, label: 'Brand Discovery' },
  { href: '/dashboard/strategy', icon: Sparkles, label: 'Brand Strategy' },
  { href: '/dashboard/identity', icon: Palette, label: 'Visual Identity' },
  { href: '/dashboard/marketing', icon: TrendingUp, label: 'Marketing Plan' },
  { href: '/dashboard/content', icon: MessageSquare, label: 'Content Engine' },
  { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/dashboard/team', icon: Users, label: 'Team' },
  { href: '/dashboard/upgrade', icon: Crown, label: 'Upgrade' },
  { href: '/dashboard/billing', icon: CreditCard, label: 'Billing' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [email, setEmail] = useState('')

  useEffect(() => {
    const supabase = createClient()
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setEmail(user.email || '')
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) setProfile(data)
    }
    fetchProfile()
  }, [router])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const displayName = profile?.full_name || email.split('@')[0] || 'User'
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  const planLabel = profile?.plan ? profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1) : 'Free'
  const queriesLeft = profile ? Math.max(0, (profile.plan === 'free' ? 10 : profile.plan === 'growth' ? 50 : 999) - profile.ai_queries_used) : 0

  return (
    <div className="min-h-screen bg-[#0F1D26] flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0A1520] border-r border-white/5 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F25C05] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-white">BrandOS</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/40 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plan badge */}
        <div className="px-4 py-3 border-b border-white/5">
          <div className={`rounded-xl px-3 py-2 flex items-center gap-2 ${profile?.plan === 'free' ? 'bg-[#D9910B]/10 border border-[#D9910B]/20' : 'bg-[#1A7A6E]/10 border border-[#1A7A6E]/20'}`}>
            <Crown className={`w-3.5 h-3.5 ${profile?.plan === 'free' ? 'text-[#D9910B]' : 'text-[#1A7A6E]'}`} />
            <span className={`text-xs font-semibold ${profile?.plan === 'free' ? 'text-[#D9910B]' : 'text-[#1A7A6E]'}`}>{planLabel} Plan</span>
            {profile?.plan === 'free' && (
              <Link href="/dashboard/settings" className="ml-auto text-[#D9910B] text-xs hover:underline">Upgrade</Link>
            )}
          </div>
        </div>

        {/* AI queries remaining */}
        {profile?.plan === 'free' && (
          <div className="px-4 py-2 border-b border-white/5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-white/30 text-xs">AI queries</span>
              <span className="text-white/50 text-xs">{queriesLeft}/10 left</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-[#F25C05] rounded-full transition-all" style={{ width: `${(queriesLeft / 10) * 100}%` }} />
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="text-white/25 text-xs font-semibold uppercase tracking-wider px-3 mb-3">Modules</div>
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${active ? 'bg-[#F25C05]/10 text-[#F25C05] border border-[#F25C05]/20' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
                <item.icon className={`flex-shrink-0 ${active ? 'text-[#F25C05]' : 'text-white/40 group-hover:text-white/70'}`} style={{ width: '18px', height: '18px' }} />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 text-[#F25C05]" />}
              </Link>
            )
          })}

          <div className="text-white/25 text-xs font-semibold uppercase tracking-wider px-3 mb-3 mt-6">Account</div>
          <Link href="/dashboard/settings" onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${pathname === '/dashboard/settings' ? 'bg-[#F25C05]/10 text-[#F25C05] border border-[#F25C05]/20' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
            <Settings style={{ width: '18px', height: '18px' }} className="text-white/40 group-hover:text-white/70" />
            <span>Settings</span>
          </Link>
        </nav>

        {/* User */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-[#F25C05]/20 flex items-center justify-center text-[#F25C05] font-bold text-sm flex-shrink-0">
              {initials || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">{displayName}</div>
              <div className="text-white/30 text-xs truncate">{email}</div>
            </div>
            <button onClick={handleSignOut} className="text-white/30 hover:text-white/60 transition-colors" title="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-[#0A1520]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-white/50 hover:text-white transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:flex items-center gap-2 text-white/30 text-sm">
            <Zap className="w-3.5 h-3.5 text-[#F25C05]" />
            <span>AI Brand Coach is ready</span>
            {profile?.business_name && (
              <span className="text-white/20">· {profile.business_name}</span>
            )}
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button className="relative w-9 h-9 rounded-xl bg-[#1A2E3D] border border-white/8 flex items-center justify-center text-white/50 hover:text-white transition-colors">
              <Bell className="w-4 h-4" />
            </button>
            <Link href="/dashboard/settings">
              <div className="w-9 h-9 rounded-xl bg-[#F25C05]/20 flex items-center justify-center text-[#F25C05] font-bold text-sm cursor-pointer hover:bg-[#F25C05]/30 transition-colors">
                {initials || 'U'}
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
      <FloatingAI />
    </div>
  )
}