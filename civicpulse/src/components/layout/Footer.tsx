import React from 'react';
import Link from 'next/link';
import { Activity, ShieldCheck, Heart, ExternalLink, PhoneCall, ArrowUpRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-[#1F2B4D] bg-[#070D1F] text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#C69214] bg-[#0B132B] text-[#E5A93C] shadow-md">
                <span className="font-brand font-bold text-xs tracking-wider">CP</span>
              </div>
              <span className="font-brand text-lg font-bold tracking-[0.2em] text-white">
                CIVICPULSE
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              World-class civic infrastructure technology connecting residents, field maintenance crews, and municipal leadership for rapid, transparent repairs.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Public SLA Compliance: <strong className="text-[#E5A93C]">94.2%</strong></span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#C69214] mb-4">
              Citizen Solutions
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/" className="hover:text-[#E5A93C] transition">
                  Home Overview
                </Link>
              </li>
              <li>
                <Link href="/report" className="hover:text-[#E5A93C] transition">
                  Report Infrastructure Defect
                </Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-[#E5A93C] transition">
                  Interactive Incident Map
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#E5A93C] transition">
                  Neighborhood Pulse Hub
                </Link>
              </li>
              <li>
                <Link href="/my-reports" className="hover:text-[#E5A93C] transition">
                  My Filed Case Reports
                </Link>
              </li>
            </ul>
          </div>

          {/* City Administration */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#C69214] mb-4">
              Operations & Governance
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/staff" className="hover:text-[#E5A93C] transition">
                  Staff Operations Desk
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="hover:text-[#E5A93C] transition">
                  Resolution Analytics & KPIs
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#E5A93C] transition">
                  Municipal FAQs (SQL Database)
                </Link>
              </li>
              <li>
                <Link href="/errors" className="hover:text-[#E5A93C] transition">
                  Error Codes Catalog (8 Codes)
                </Link>
              </li>
              <li>
                <Link href="/health" className="hover:text-[#E5A93C] transition">
                  Platform Health Telemetry
                </Link>
              </li>
              <li>
                <Link href="/settings" className="hover:text-[#E5A93C] transition">
                  Security & Role Preferences
                </Link>
              </li>
            </ul>
          </div>

          {/* Emergency Assistance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#C69214] mb-4">
              Immediate Assistance
            </h4>
            <div className="rounded-2xl bg-[#0B132B] p-4 border border-[#1F2B4D] text-xs">
              <div className="flex items-center gap-2 font-semibold text-white mb-1.5">
                <PhoneCall className="h-4 w-4 text-amber-500" />
                <span>Life-Threatening Emergency?</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Call <strong className="text-white">911</strong> immediately for live downed power lines, severe gas leaks, or major traffic collisions.
              </p>
            </div>
            <p className="text-[11px] text-slate-400">
              Non-emergency municipal hotline: <strong className="text-slate-200">311</strong> (Mon–Fri 7am–7pm)
            </p>
          </div>
        </div>

        {/* Clean Signature: NO POWERED BY, ONLY Built by Sanjay Rajendran */}
        <div className="mt-12 border-t border-[#1F2B4D] pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 CivicPulse Platform. All rights reserved.</p>
          <div className="flex items-center gap-2 font-medium text-slate-300">
            <span>Built by <strong className="text-[#E5A93C] font-semibold">Sanjay Rajendran</strong></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
