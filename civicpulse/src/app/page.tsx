'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  MapPin, 
  Camera, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  TrendingUp, 
  Building2, 
  Sparkles,
  Layers,
  AlertTriangle,
  Lightbulb,
  Droplets,
  Hammer,
  HelpCircle,
  ChevronDown,
  Bot,
  Send,
  Users,
  Search,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { getIssues, getDashboardStats, getFAQs } from '@/lib/data';
import { Issue, IssueStats, FAQItem } from '@/types/database';

export default function HomePage() {
  const [stats, setStats] = useState<IssueStats | null>(null);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  // Quick Consultation Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formType, setFormType] = useState('pothole');
  const [formMessage, setFormMessage] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    async function loadData() {
      const s = await getDashboardStats();
      setStats(s);
      const f = await getFAQs();
      setFaqs(f.slice(0, 5));
    }
    loadData();
  }, []);

  const handleConsultationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail.trim() || !formMessage.trim()) return;

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('open-civic-chat', {
          detail: {
            query: `Municipal Consultation Inquiry from ${formName || 'Citizen'} (${formEmail}): Type: ${formType}. Message: "${formMessage}". Please provide immediate FAQ guidance and create an official support ticket.`,
          },
        })
      );
    }
    setFormSubmitted(true);
  };

  const handleAskAssistant = (question: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('open-civic-chat', {
          detail: { query: question },
        })
      );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* =====================================================================
          1. PROSPERUM-INSPIRED LUXURY HERO SECTION
          ===================================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#070D1F] via-[#0B132B] to-[#0E1838] text-white pt-20 pb-36 lg:pb-44">
        {/* Subtle decorative curved ambient light lines */}
        <div className="absolute inset-0 opacity-15 pointer-events-none overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 1440 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M-100 500 C 300 450, 700 200, 1540 300" stroke="#C69214" strokeWidth="2.5" />
            <path d="M-100 540 C 350 490, 750 250, 1540 350" stroke="#D4AF37" strokeWidth="1" strokeDasharray="6 6" />
            <path d="M-100 580 C 400 530, 800 300, 1540 400" stroke="#E5A93C" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Ambient background glow */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#C69214]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Headline & Action */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#C69214]/40 bg-[#C69214]/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-[#E5A93C]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E5A93C] animate-pulse" />
                World-Class Civic Technology Platform
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-[1.15]">
                Achieve Resilient Infrastructure & Civic Trust
              </h1>

              <p className="text-base sm:text-lg text-slate-300 font-sans max-w-xl leading-relaxed">
                Expert civic infrastructure intelligence and verified municipal dispatch solutions tailored for transparent, modern city governance.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/report"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C69214] via-[#D4AF37] to-[#B8860B] px-8 py-3.5 text-sm font-bold text-[#070D1F] tracking-wide uppercase shadow-lg shadow-amber-950/40 hover:brightness-110 active:scale-98 transition font-sans"
                >
                  Report an Issue
                </Link>

                <Link
                  href="/map"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-600 bg-white/5 backdrop-blur-sm px-6 py-3.5 text-sm font-semibold text-slate-200 hover:bg-white/10 hover:border-slate-400 transition"
                >
                  <MapPin className="h-4 w-4 text-[#C69214]" />
                  Explore Public Map
                </Link>
              </div>
            </div>

            {/* Right: 3 Glowing Metric Cards (Prosperum Style) */}
            <div className="lg:col-span-5 flex items-center justify-center lg:justify-end gap-3 sm:gap-4">
              {/* Card 1: Dark Slate Arrow Card */}
              <div className="flex flex-col items-center justify-center w-28 sm:w-32 h-28 sm:h-32 rounded-2xl bg-[#0E1738]/90 border border-[#1F2B4D] backdrop-blur-md p-3 text-center shadow-xl hover:-translate-y-1 transition">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#070D1F] border border-slate-700 text-white mb-2">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                </div>
                <span className="text-xs font-bold text-white">94.2%</span>
                <span className="text-[10px] text-slate-400">Resolution SLA</span>
              </div>

              {/* Card 2: Gold Highlight Center Card */}
              <div className="flex flex-col items-center justify-center w-32 sm:w-36 h-32 sm:h-36 rounded-2xl bg-gradient-to-b from-[#C69214] to-[#B8860B] text-[#070D1F] p-4 text-center shadow-2xl shadow-amber-950/60 hover:-translate-y-1 transition">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#070D1F]/20 text-[#070D1F] mb-2">
                  <Users className="h-5 w-5 text-[#070D1F]" />
                </div>
                <span className="text-sm font-extrabold text-[#070D1F]">24,800+</span>
                <span className="text-[10px] font-semibold text-[#070D1F]/80 uppercase tracking-wider">Residents</span>
              </div>

              {/* Card 3: Deep Navy Shield Card */}
              <div className="flex flex-col items-center justify-center w-28 sm:w-32 h-28 sm:h-32 rounded-2xl bg-[#0E1738]/90 border border-[#1F2B4D] backdrop-blur-md p-3 text-center shadow-xl hover:-translate-y-1 transition">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#070D1F] border border-slate-700 text-white mb-2">
                  <ShieldCheck className="h-5 w-5 text-[#C69214]" />
                </div>
                <span className="text-xs font-bold text-white">1.9 Days</span>
                <span className="text-[10px] text-slate-400">Avg. Turnaround</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. 3 OVERLAPPING FLOATING CARDS (Hanging off hero boundary)
          ===================================================================== */}
      <section className="relative -mt-20 sm:-mt-24 z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Floating Card 1 */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xl shadow-slate-900/10 flex flex-col justify-between hover:border-amber-400/60 hover:-translate-y-1 transition duration-200">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B132B] text-[#C69214] shadow-xs">
                  <Camera className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-serif">
                  Intelligent Intake
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Geotag public road defects, streetlight outages, and water leaks instantly with GPS coordinates and photographic evidence.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <Link 
                href="/report" 
                className="text-xs font-bold text-[#C69214] hover:text-[#B8860B] flex items-center gap-1 uppercase tracking-wider"
              >
                Discover More <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Floating Card 2 */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xl shadow-slate-900/10 flex flex-col justify-between hover:border-amber-400/60 hover:-translate-y-1 transition duration-200">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#C69214] text-[#070D1F] shadow-xs">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-serif">
                  Proximity Intelligence
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Automated Haversine spatial algorithms identify duplicate reports within 150 meters to merge community upvotes into single work orders.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <Link 
                href="/map" 
                className="text-xs font-bold text-[#C69214] hover:text-[#B8860B] flex items-center gap-1 uppercase tracking-wider"
              >
                Discover More <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Floating Card 3 */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xl shadow-slate-900/10 flex flex-col justify-between hover:border-amber-400/60 hover:-translate-y-1 transition duration-200">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B132B] text-emerald-400 shadow-xs">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-serif">
                  Verified Dispatch
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Authorized municipal crews triage, assign field trucks, log chronological status updates, and verify completion with before/after photo audits.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <Link 
                href="/staff" 
                className="text-xs font-bold text-[#C69214] hover:text-[#B8860B] flex items-center gap-1 uppercase tracking-wider"
              >
                Discover More <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. OUR INFRASTRUCTURE SOLUTIONS (3 Visual Showcase Cards)
          ===================================================================== */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight">
              Our Infrastructure Solutions
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-500 font-sans">
              Specialized municipal reporting domains structured for rapid emergency triage and scheduled public maintenance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Solution Card 1: Roadways */}
            <div className="rounded-3xl border border-slate-200 overflow-hidden bg-white shadow-lg hover:shadow-xl transition flex flex-col">
              <div className="relative h-56 bg-gradient-to-br from-slate-800 to-slate-950 p-6 flex flex-col justify-end text-white overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay" />
                <div className="relative z-10">
                  <span className="inline-block rounded-full bg-[#C69214] px-2.5 py-0.5 text-[10px] font-bold text-[#070D1F] uppercase tracking-wider mb-2">
                    Department of Transportation
                  </span>
                  <h3 className="text-xl font-bold font-serif text-white">Roadways & Asphalt</h3>
                </div>
                {/* Floating circular icon badge */}
                <div className="absolute -bottom-5 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#0B132B] border-2 border-white shadow-md text-[#C69214]">
                  <Hammer className="h-5 w-5" />
                </div>
              </div>

              <div className="p-6 pt-8 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Pothole patching, roadway surface cratering, structural asphalt subsidence, and missing traffic corridor signage.
                </p>
                <Link
                  href="/report"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C69214] to-[#B8860B] px-5 py-2.5 text-xs font-bold text-[#070D1F] uppercase tracking-wider hover:brightness-110 transition"
                >
                  Report Roadway
                </Link>
              </div>
            </div>

            {/* Solution Card 2: Water & Utilities */}
            <div className="rounded-3xl border border-slate-200 overflow-hidden bg-white shadow-lg hover:shadow-xl transition flex flex-col">
              <div className="relative h-56 bg-gradient-to-br from-cyan-950 to-slate-900 p-6 flex flex-col justify-end text-white overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay" />
                <div className="relative z-10">
                  <span className="inline-block rounded-full bg-[#C69214] px-2.5 py-0.5 text-[10px] font-bold text-[#070D1F] uppercase tracking-wider mb-2">
                    Water & Sewage Authority
                  </span>
                  <h3 className="text-xl font-bold font-serif text-white">Water & Hydro Grid</h3>
                </div>
                {/* Floating circular icon badge */}
                <div className="absolute -bottom-5 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#C69214] border-2 border-white shadow-md text-[#070D1F]">
                  <Droplets className="h-5 w-5" />
                </div>
              </div>

              <div className="p-6 pt-8 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Pressurized water main leaks, storm drain clogs, sewer backups, and damaged municipal fire hydrants.
                </p>
                <Link
                  href="/report"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C69214] to-[#B8860B] px-5 py-2.5 text-xs font-bold text-[#070D1F] uppercase tracking-wider hover:brightness-110 transition"
                >
                  Report Water Leak
                </Link>
              </div>
            </div>

            {/* Solution Card 3: Electrical & Lighting */}
            <div className="rounded-3xl border border-slate-200 overflow-hidden bg-white shadow-lg hover:shadow-xl transition flex flex-col">
              <div className="relative h-56 bg-gradient-to-br from-amber-950 to-slate-950 p-6 flex flex-col justify-end text-white overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay" />
                <div className="relative z-10">
                  <span className="inline-block rounded-full bg-[#C69214] px-2.5 py-0.5 text-[10px] font-bold text-[#070D1F] uppercase tracking-wider mb-2">
                    Public Works & Energy
                  </span>
                  <h3 className="text-xl font-bold font-serif text-white">Lighting & Public Safety</h3>
                </div>
                {/* Floating circular icon badge */}
                <div className="absolute -bottom-5 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#0B132B] border-2 border-white shadow-md text-[#C69214]">
                  <Lightbulb className="h-5 w-5" />
                </div>
              </div>

              <div className="p-6 pt-8 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Streetlight bulb outages, dark pedestrian crosswalks, traffic light sequence faults, and hazardous debris.
                </p>
                <Link
                  href="/report"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C69214] to-[#B8860B] px-5 py-2.5 text-xs font-bold text-[#070D1F] uppercase tracking-wider hover:brightness-110 transition"
                >
                  Report Streetlight
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. HOW WE WORK & LUXURY CONSULTATION FORM (Prosperum Style)
          ===================================================================== */}
      <section className="py-24 bg-slate-50/70 border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left: How We Work Steps */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight">
                  How We Work
                </h2>
                <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-xl">
                  A transparent three-phase lifecycle connecting citizen field reports directly to municipal asphalt and utility crews.
                </p>
              </div>

              {/* 3 Step Flow */}
              <div className="space-y-6 pt-4">
                {/* Step 1 */}
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B132B] text-[#C69214] font-bold text-sm shrink-0">
                    01
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 font-serif">
                      Citizen Discovery & Intake
                    </h4>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Residents submit real-time reports with exact pin drop coordinates, photos, and defect descriptions. Proximity detection checks for existing nearby tickets.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C69214] text-[#070D1F] font-bold text-sm shrink-0">
                    02
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 font-serif">
                      Strategic Triage & Crew Dispatch
                    </h4>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Dispatch supervisors review automated hazard priority scores, schedule work orders with specialized field departments, and set SLA resolution targets.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B132B] text-emerald-400 font-bold text-sm shrink-0">
                    03
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 font-serif">
                      Execution & Supervisor Verification
                    </h4>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Field crews complete the physical repair, upload photographic verification, and supervisors sign off to update the public audit timeline.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Dark Luxury Consultation Form (Inspired by Prosperum "Schedule Your Consultation") */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl bg-gradient-to-b from-[#0B132B] to-[#070D1F] border border-[#1F2B4D] p-8 sm:p-10 text-white shadow-2xl">
                <div className="mb-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#C69214]">
                    Direct City Dispatch Access
                  </span>
                  <h3 className="text-2xl font-serif font-bold text-white mt-1">
                    Request Municipal Consultation
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Submit a direct inquiry or escalate an unresolved ticket to our municipal engineering supervisors.
                  </p>
                </div>

                {formSubmitted ? (
                  <div className="rounded-2xl bg-[#C69214]/15 border border-[#C69214] p-6 text-center space-y-3">
                    <CheckCircle2 className="h-10 w-10 text-[#E5A93C] mx-auto" />
                    <h4 className="text-sm font-bold text-white">Inquiry Forwarded to Dispatch</h4>
                    <p className="text-xs text-slate-300">
                      Our AI assistant and operations supervisors have received your inquiry. Check your chat widget for immediate status.
                    </p>
                    <button
                      onClick={() => setFormSubmitted(false)}
                      className="text-xs font-semibold text-[#E5A93C] underline pt-2"
                    >
                      Send Another Request
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleConsultationSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Your Name</label>
                        <input
                          type="text"
                          required
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          placeholder="Elena Rostova"
                          className="w-full rounded-xl bg-[#0E1738] border border-[#1F2B4D] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#C69214] focus:outline-hidden transition"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Email Address</label>
                        <input
                          type="email"
                          required
                          value={formEmail}
                          onChange={(e) => setFormEmail(e.target.value)}
                          placeholder="elena@example.com"
                          className="w-full rounded-xl bg-[#0E1738] border border-[#1F2B4D] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#C69214] focus:outline-hidden transition"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Phone (Optional)</label>
                        <input
                          type="tel"
                          value={formPhone}
                          onChange={(e) => setFormPhone(e.target.value)}
                          placeholder="(206) 555-0182"
                          className="w-full rounded-xl bg-[#0E1738] border border-[#1F2B4D] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#C69214] focus:outline-hidden transition"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Infrastructure Focus</label>
                        <select
                          value={formType}
                          onChange={(e) => setFormType(e.target.value)}
                          className="w-full rounded-xl bg-[#0E1738] border border-[#1F2B4D] px-3.5 py-2.5 text-xs text-white focus:border-[#C69214] focus:outline-hidden transition"
                        >
                          <option value="pothole">Roadways & Pavement</option>
                          <option value="water_leak">Water Main / Drainage</option>
                          <option value="streetlight">Streetlight & Lighting</option>
                          <option value="traffic_signal">Traffic Signals</option>
                          <option value="general">Municipal Governance</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">Inquiry / Case Details</label>
                      <textarea
                        required
                        rows={3}
                        value={formMessage}
                        onChange={(e) => setFormMessage(e.target.value)}
                        placeholder="Describe your inquiry, street location, or existing ticket number..."
                        className="w-full rounded-xl bg-[#0E1738] border border-[#1F2B4D] px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-[#C69214] focus:outline-hidden transition resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C69214] via-[#D4AF37] to-[#B8860B] py-3 text-xs sm:text-sm font-bold text-[#070D1F] tracking-wide uppercase hover:brightness-110 active:scale-98 transition shadow-lg shadow-amber-950/40"
                    >
                      <Send className="h-4 w-4" />
                      Submit Consultation Request
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. MUNICIPAL FAQS IN SQL ACCORDION (Requirement Fulfillment)
          ===================================================================== */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#C69214]">
              SQL Database Grounded Answers
            </span>
            <h2 className="text-3xl font-serif font-bold text-slate-900 tracking-tight mt-1">
              Municipal Questions & Policies
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">
              Browse common answers or ask our integrated AI Assistant on any page.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => {
              const isExpanded = expandedFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs hover:border-slate-300 transition"
                >
                  <button
                    onClick={() => setExpandedFaq(isExpanded ? null : faq.id)}
                    className="w-full text-left px-6 py-4 flex items-center justify-between gap-4"
                  >
                    <span className="text-sm font-semibold text-slate-900 font-sans">
                      {faq.question}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-[#C69214] shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      <p>{faq.answer}</p>
                      <div className="mt-3 flex items-center justify-between pt-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          Category: {faq.category}
                        </span>
                        <button
                          onClick={() => handleAskAssistant(faq.question)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C69214] hover:text-[#B8860B]"
                        >
                          <Bot className="h-3.5 w-3.5" />
                          Ask Assistant About This
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/faq"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C69214] hover:text-[#B8860B] uppercase tracking-wider"
            >
              Browse All 12 Municipal FAQs <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
