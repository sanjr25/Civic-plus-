'use client';

import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Bell, 
  ShieldCheck, 
  Database, 
  Check, 
  Save, 
  UserCheck, 
  Info,
  RefreshCw,
  ExternalLink,
  Code2
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/types/database';

export default function SettingsPage() {
  const { user, role, switchRole, updateProfile, isSupabaseLive } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [notifyEmail, setNotifyEmail] = useState(user?.notification_email ?? true);
  const [notifySms, setNotifySms] = useState(user?.notification_sms ?? false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      full_name: fullName,
      email,
      phone,
      notification_email: notifyEmail,
      notification_sms: notifySms,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetLocalData = () => {
    if (confirm('Reset local civic database to default sample dataset?')) {
      localStorage.removeItem('civicpulse_issues_v1');
      localStorage.removeItem('civicpulse_timeline_v1');
      localStorage.removeItem('civicpulse_upvotes_v1');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div>
          <span className="rounded-md bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800 border border-teal-200">
            Account & Operations Preferences
          </span>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">
            User Profile & System Settings
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your personal profile, notification thresholds, and test role-based access permissions.
          </p>
        </div>

        {savedSuccess && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs sm:text-sm text-emerald-800 flex items-center gap-2">
            <Check className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <span>Profile and notification preferences updated successfully!</span>
          </div>
        )}

        {/* Section 1: Persona Switcher */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            <UserCheck className="h-5 w-5 text-teal-600" />
            <h2 className="text-base font-bold text-slate-900">
              Role-Based Access Control (RBAC) Switcher
            </h2>
          </div>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Switch between personas below to evaluate the complete civic governance lifecycle from both citizen reporting and staff resolution perspectives.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Citizen Persona */}
            <button
              type="button"
              onClick={() => switchRole('citizen')}
              className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                role === 'citizen'
                  ? 'border-teal-600 bg-teal-50/60 ring-2 ring-teal-600/30'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                    Citizen Role
                  </span>
                  {role === 'citizen' && <span className="text-teal-700 font-bold text-xs">Active ✓</span>}
                </div>
                <h4 className="text-sm font-bold text-slate-900">Elena Rostova</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Community resident in Downtown district. Can submit issues, track own tickets, and upvote hazards.
                </p>
              </div>
              <span className="text-[11px] text-teal-700 font-medium mt-3 block">
                Standard Permissions
              </span>
            </button>

            {/* Staff Inspector Persona */}
            <button
              type="button"
              onClick={() => switchRole('staff')}
              className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                role === 'staff'
                  ? 'border-teal-600 bg-teal-50/60 ring-2 ring-teal-600/30'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded-md bg-teal-100 px-2 py-0.5 text-[11px] font-semibold text-teal-800">
                    Staff Inspector
                  </span>
                  {role === 'staff' && <span className="text-teal-700 font-bold text-xs">Active ✓</span>}
                </div>
                <h4 className="text-sm font-bold text-slate-900">Marcus Vance</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Department of Public Works. Can triage intake, assign field crews, adjust priority, and log repairs.
                </p>
              </div>
              <span className="text-[11px] text-teal-700 font-medium mt-3 block">
                Triage & Dispatch Authorized
              </span>
            </button>

            {/* Director Admin Persona */}
            <button
              type="button"
              onClick={() => switchRole('admin')}
              className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                role === 'admin'
                  ? 'border-teal-600 bg-teal-50/60 ring-2 ring-teal-600/30'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded-md bg-purple-100 px-2 py-0.5 text-[11px] font-semibold text-purple-800">
                    Operations Director
                  </span>
                  {role === 'admin' && <span className="text-teal-700 font-bold text-xs">Active ✓</span>}
                </div>
                <h4 className="text-sm font-bold text-slate-900">Director Patel</h4>
                <p className="text-xs text-slate-500 mt-1">
                  City Infrastructure Oversight. Full system administration, audit review, and SLA governance.
                </p>
              </div>
              <span className="text-[11px] text-teal-700 font-medium mt-3 block">
                Full Administrative Access
              </span>
            </button>
          </div>
        </div>

        {/* Section 2: Profile Form */}
        <form onSubmit={handleSave} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-5 w-5 text-teal-600" />
            <h2 className="text-base font-bold text-slate-900">
              Personal Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Legal Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs sm:text-sm text-slate-900 focus:border-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs sm:text-sm text-slate-900 focus:border-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Phone (Optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(206) 555-0100"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs sm:text-sm text-slate-900 focus:border-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assigned Municipality / District
              </label>
              <input
                type="text"
                disabled
                value="District 7 (Downtown / Central Metro)"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs sm:text-sm text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Notifications */}
          <div className="border-t border-slate-100 pt-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Bell className="h-4 w-4 text-teal-600" />
              Status Notification Alerts
            </h3>

            <div className="space-y-2">
              <label className="flex items-center gap-3 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.checked)}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <div>
                  <span className="font-semibold block">Email Notifications</span>
                  <span className="text-slate-500 text-[11px]">
                    Receive email receipts when status advances (e.g. Under Review → In Progress → Resolved).
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifySms}
                  onChange={(e) => setNotifySms(e.target.checked)}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <div>
                  <span className="font-semibold block">SMS Emergency Alerts</span>
                  <span className="text-slate-500 text-[11px]">
                    Receive text messages only for high-severity hazards in your immediate zip code.
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-teal-700 transition"
            >
              <Save className="h-4 w-4" />
              Save Preferences
            </button>
          </div>
        </form>

        {/* Section 3: Supabase Integration & Setup Guide */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-teal-600" />
              <h2 className="text-base font-bold text-slate-900">
                Supabase PostgreSQL & Storage Status
              </h2>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                isSupabaseLive
                  ? 'bg-teal-100 text-teal-800 border border-teal-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              {isSupabaseLive ? '● Live Supabase Connected' : '● Local Offline Database Mode'}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            CivicPulse features an intelligent dual-mode architecture. When live Supabase credentials are configured in <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">.env.local</code>, it interfaces directly with PostgreSQL tables and Supabase Storage buckets. When running locally without environment keys, it operates with complete interactive fidelity using a synchronized client-side database.
          </p>

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs space-y-2">
            <span className="font-bold text-slate-800 block">Production Setup Instructions:</span>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 leading-relaxed">
              <li>Create a new project on <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-teal-700 underline font-medium">Supabase</a>.</li>
              <li>Execute the SQL schema in <code className="bg-white px-1 py-0.5 rounded border border-slate-200 font-mono text-[11px]">supabase/schema.sql</code> inside the Supabase SQL Editor.</li>
              <li>Add the following keys to your <code className="bg-white px-1 py-0.5 rounded border border-slate-200 font-mono text-[11px]">.env.local</code> file:</li>
            </ol>
            <pre className="mt-2 rounded-lg bg-slate-900 p-3 font-mono text-[11px] text-teal-300 overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}
            </pre>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleResetLocalData}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-700 hover:text-rose-900 transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset Local Sample Dataset
            </button>

            <span className="text-[11px] text-slate-400">
              CivicPulse v1.0.0 — Next.js 16 & TypeScript
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
