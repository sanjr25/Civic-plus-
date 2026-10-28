'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/types/database';
import { 
  MapPin, 
  LayoutDashboard, 
  FileText, 
  ShieldCheck, 
  BarChart3, 
  PlusCircle, 
  Menu, 
  X, 
  HelpCircle,
  Activity,
  Layers,
  ChevronDown,
  Code2,
  UserCheck
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { user, role, switchRole, isStaff } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stackDropdownOpen, setStackDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Stack Menu Options (grouped logically in a distinct color-accented stack dropdown)
  const stackOptions = [
    {
      group: 'Citizen Solutions',
      items: [
        { label: 'Public Incidents Map', href: '/map', icon: MapPin, desc: 'Interactive Leaflet city map with real-time pins' },
        { label: 'Citizen Reporting Hub', href: '/dashboard', icon: LayoutDashboard, desc: 'Live community feed and status tracker' },
        { label: 'Municipal FAQs (SQL)', href: '/faq', icon: HelpCircle, desc: '12 verified city infrastructure FAQs' },
        { label: 'My Filed Reports', href: '/my-reports', icon: FileText, desc: 'Personal cases and neighborhood endorsements' },
      ],
    },
    {
      group: 'City Operations & Governance',
      items: [
        { label: 'Staff Operations Desk', href: '/staff', icon: ShieldCheck, desc: 'Triage, crew dispatch, and supervisor audit' },
        { label: 'Resolution Analytics', href: '/analytics', icon: BarChart3, desc: 'Real-time SLA velocity and KPI telemetry' },
        { label: 'Platform Health Telemetry', href: '/health', icon: Activity, desc: 'PostgreSQL, MongoDB Atlas, and API status' },
        { label: 'Error Codes Catalog', href: '/errors', icon: Code2, desc: '8 coded error scenarios with test simulator' },
      ],
    },
  ];

  const handleRoleChange = (newRole: UserRole) => {
    switchRole(newRole);
    setRoleDropdownOpen(false);
  };

  const isHome = pathname === '/';

  return (
    <header className="sticky top-0 z-50 bg-[#0B132B] text-white border-b border-[#1F2B4D]/60 shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-20">
        {/* Left: Classic Luxury Logo Monogram inspired by Prosperum */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#C69214] bg-[#070D1F] shadow-md shadow-amber-950/40 group-hover:border-[#E5A93C] transition">
            <span className="font-brand font-bold text-sm tracking-wider text-[#E5A93C]">
              CP
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-brand text-lg font-extrabold tracking-[0.25em] text-white uppercase group-hover:text-amber-100 transition">
              CIVICPULSE
            </span>
            <span className="text-[9px] tracking-[0.2em] font-medium text-[#C69214] uppercase">
              Municipal Intelligence
            </span>
          </div>
        </Link>

        {/* Center: First HOME, then STACK OPTIONS in distinct color */}
        <nav className="hidden lg:flex items-center gap-8">
          {/* 1. Only HOME Page first */}
          <Link
            href="/"
            className={`text-sm font-medium tracking-wide transition relative py-1 ${
              isHome
                ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#C69214]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Home
          </Link>

          {/* 2. Rest of Menu Options in a DISTINCT COLORED STACK DROPDOWN */}
          <div className="relative">
            <button
              onClick={() => setStackDropdownOpen(!stackDropdownOpen)}
              onMouseEnter={() => setStackDropdownOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-[#C69214]/60 bg-[#C69214]/15 px-4 py-1.5 text-xs font-semibold tracking-wider text-[#E5A93C] hover:bg-[#C69214]/25 hover:border-[#E5A93C] transition shadow-xs"
            >
              <Layers className="h-3.5 w-3.5 text-[#E5A93C]" />
              <span>STACK OPTIONS</span>
              <ChevronDown className={`h-3 w-3 text-[#E5A93C] transition-transform ${stackDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Luxury Mega Stack Dropdown Menu */}
            {stackDropdownOpen && (
              <div 
                onMouseLeave={() => setStackDropdownOpen(false)}
                className="absolute left-1/2 -translate-x-1/2 mt-3 w-[620px] rounded-2xl border border-[#1F2B4D] bg-[#0E1738] p-5 text-white shadow-2xl shadow-black/60 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="grid grid-cols-2 gap-6">
                  {stackOptions.map((group) => (
                    <div key={group.group}>
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#C69214] mb-3 pb-1 border-b border-[#1F2B4D]">
                        {group.group}
                      </h4>
                      <div className="space-y-1.5">
                        {group.items.map((item) => {
                          const Icon = item.icon;
                          const isActive = pathname === item.href;
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setStackDropdownOpen(false)}
                              className={`flex items-start gap-3 p-2.5 rounded-xl transition ${
                                isActive 
                                  ? 'bg-[#C69214]/20 text-[#E5A93C] border border-[#C69214]/30' 
                                  : 'hover:bg-[#16214A] text-slate-200'
                              }`}
                            >
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#070D1F] border border-[#1F2B4D] text-[#C69214] shrink-0 mt-0.5">
                                <Icon className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="text-xs font-semibold text-white">
                                  {item.label}
                                </div>
                                <div className="text-[11px] text-slate-400 line-clamp-1">
                                  {item.desc}
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Dropdown Quick Footer */}
                <div className="mt-4 pt-3 border-t border-[#1F2B4D] flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    CivicPulse Infrastructure Engine v1.0
                  </span>
                  <Link 
                    href="/errors" 
                    onClick={() => setStackDropdownOpen(false)}
                    className="text-[#C69214] hover:underline"
                  >
                    View Error Catalog →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right: Persona Switcher & Gold CTA Button */}
        <div className="hidden sm:flex items-center gap-4">
          {/* Persona Switcher in elegant dark pill */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 rounded-full border border-[#1F2B4D] bg-[#0E1738] px-3.5 py-1.5 text-xs text-slate-300 hover:text-white hover:border-[#C69214]/50 transition"
              title="Switch Persona"
            >
              <UserCheck className="h-3.5 w-3.5 text-[#C69214]" />
              <span className="text-[11px] text-slate-400">Persona:</span>
              <span className="capitalize font-semibold text-white">
                {mounted ? role : 'Citizen'}
              </span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#1F2B4D] bg-[#0E1738] p-2 text-white shadow-xl z-50">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#C69214] border-b border-[#1F2B4D]">
                  Switch Role Persona
                </div>
                <button
                  onClick={() => handleRoleChange('citizen')}
                  className={`w-full text-left px-3 py-2 text-xs rounded-xl flex items-center justify-between transition mt-1 ${
                    role === 'citizen' ? 'bg-[#C69214]/20 text-[#E5A93C] font-semibold' : 'hover:bg-[#16214A]'
                  }`}
                >
                  <div>
                    <p className="font-medium text-white">Citizen</p>
                    <p className="text-[10px] text-slate-400">Elena Rostova</p>
                  </div>
                  {role === 'citizen' && <span className="text-[#C69214]">✓</span>}
                </button>
                <button
                  onClick={() => handleRoleChange('staff')}
                  className={`w-full text-left px-3 py-2 text-xs rounded-xl flex items-center justify-between transition ${
                    role === 'staff' ? 'bg-[#C69214]/20 text-[#E5A93C] font-semibold' : 'hover:bg-[#16214A]'
                  }`}
                >
                  <div>
                    <p className="font-medium text-white">Staff Inspector</p>
                    <p className="text-[10px] text-slate-400">Marcus Vance</p>
                  </div>
                  {role === 'staff' && <span className="text-[#C69214]">✓</span>}
                </button>
                <button
                  onClick={() => handleRoleChange('admin')}
                  className={`w-full text-left px-3 py-2 text-xs rounded-xl flex items-center justify-between transition ${
                    role === 'admin' ? 'bg-[#C69214]/20 text-[#E5A93C] font-semibold' : 'hover:bg-[#16214A]'
                  }`}
                >
                  <div>
                    <p className="font-medium text-white">Operations Director</p>
                    <p className="text-[10px] text-slate-400">Ananya Patel</p>
                  </div>
                  {role === 'admin' && <span className="text-[#C69214]">✓</span>}
                </button>
              </div>
            )}
          </div>

          {/* Luxury Gold CTA Button inspired by Prosperum "Schedule Consultation" */}
          <Link
            href="/report"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#C69214] via-[#D4AF37] to-[#B8860B] px-5 py-2.5 text-xs sm:text-sm font-bold text-[#070D1F] tracking-wide shadow-md shadow-amber-950/30 hover:brightness-110 active:scale-98 transition uppercase font-sans"
          >
            <PlusCircle className="h-4 w-4 text-[#070D1F]" />
            Report Issue
          </Link>

          {/* Profile Avatar */}
          <Link
            href="/settings"
            title="User Profile & Settings"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#1F2B4D] bg-[#0E1738] text-slate-200 hover:border-[#C69214] hover:text-[#C69214] transition"
          >
            <span className="text-xs font-bold uppercase font-sans" suppressHydrationWarning>
              {mounted ? (user?.full_name?.substring(0, 2) || 'CP') : 'CP'}
            </span>
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden rounded-xl p-2 text-slate-300 hover:bg-[#1F2B4D]"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#1F2B4D] bg-[#0B132B] px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block rounded-lg px-3 py-2 text-sm font-semibold ${
              isHome ? 'bg-[#C69214]/20 text-[#E5A93C]' : 'text-slate-200'
            }`}
          >
            Home
          </Link>

          <div className="pt-2 border-t border-[#1F2B4D]">
            <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#C69214] mb-2">
              Stack Options
            </div>
            {stackOptions.flatMap((g) => g.items).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-xs text-slate-300 hover:text-white"
                >
                  <Icon className="h-4 w-4 text-[#C69214]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#1F2B4D] flex flex-col gap-2">
            <Link
              href="/report"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C69214] to-[#B8860B] py-3 text-sm font-bold text-[#070D1F] uppercase"
            >
              <PlusCircle className="h-4 w-4" />
              Report Issue
            </Link>
            <Link
              href="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center rounded-xl border border-[#1F2B4D] py-2 text-xs font-semibold text-slate-300"
            >
              Profile & Settings
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
