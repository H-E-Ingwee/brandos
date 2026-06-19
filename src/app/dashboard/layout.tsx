'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Sparkles, LayoutDashboard, Target, Palette, TrendingUp,
  MessageSquare, BarChart3, Settings, ChevronRight, Bell,
  User, LogOut, Menu, X, Zap, Crown
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', badge: null },
  { href: '/dashboard/discovery', icon: Target, label: 'Brand Discovery', badge: null },
  { href: '/dashboard/strategy', icon: Sparkles, label: 'Brand Strategy', badge: 'New' },
  { href: '/dashboard/identity', icon: Palette, label: 'Visual Identity', badge: null },
  { href: '/dashboard/marketing', icon: TrendingUp, label: 'Marketing Plan', badge: null },
  { href: '/dashboard/content', icon: MessageSquare, label: 'Content Engine', badge: null },
  { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics', badge: null },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#0F1D26] flex">
      {/* Mobile overlay */}
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
          <div className="bg-[#D9910B]/10 border border-[#D9910B]/20 rounded-xl px-3 py-2 flex items-center gap-2">
            <Crown className="w-3.5 h-3.5 text-[#D9910B]" />
            <span className="text-[#D9910B] text-xs font-semibold">Free Plan</span>
            <Link href="/dashboard/settings" className="ml-auto text-[#D9910B] text-xs hover:underline">Upgrade</Link>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="text-white/25 text-xs font-semibold uppercase tracking-wider px-3 mb-3">Modules</div>
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                  active
                    ? 'bg-[#F25C05]/10 text-[#F25C05] border border-[#F25C05]/20'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className={`w-4.5 h-4.5 flex-shrink-0 ${active ? 'text-[#F25C05]' : 'text-white/40 group-hover:text-white/70'}`} style={{ width: '18px', height: '18px' }} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="bg-[#F25C05] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{item.badge}</span>
                )}
                {active && <ChevronRight className="w-3.5 h-3.5 text-[#F25C05]" />}
              </Link>
            )
          })}

          <div className="text-white/25 text-xs font-semibold uppercase tracking-wider px-3 mb-3 mt-6">Account</div>
          <Link href="/dashboard/settings" onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${pathname === '/dashboard/settings' ? 'bg-[#F25C05]/10 text-[#F25C05] border border-[#F25C05]/20' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
            <Settings className="w-4.5 h-4.5 flex-shrink-0 text-white/40 group-hover:text-white/70" style={{ width: '18px', height: '18px' }} />
            <span>Settings</span>
          </Link>
        </nav>

        {/* User */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-[#F25C05]/20 flex items-center justify-center text-[#F25C05] font-bold text-sm">J</div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">Jane Wanjiku</div>
              <div className="text-white/30 text-xs truncate">jane@business.co.ke</div>
            </div>
            <button className="text-white/30 hover:text-white/60 transition-colors">
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
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button className="relative w-9 h-9 rounded-xl bg-[#1A2E3D] border border-white/8 flex items-center justify-center text-white/50 hover:text-white transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F25C05] rounded-full" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-[#F25C05]/20 flex items-center justify-center text-[#F25C05] font-bold text-sm cursor-pointer">J</div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}