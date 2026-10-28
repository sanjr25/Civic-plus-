'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Download, 
  Layers, 
  Calendar,
  Building2,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import { getDashboardStats, getIssues } from '@/lib/data';
import { IssueStats, Issue } from '@/types/database';
import { LoadingSpinner } from '@/components/ui/States';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<IssueStats | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | 'all'>('30d');

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, all] = await Promise.all([getDashboardStats(), getIssues()]);
      setStats(s);
      setIssues(all);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const exportCSV = () => {
    if (!issues || issues.length === 0) return;
    const headers = ['ID', 'Title', 'Category', 'Priority', 'Status', 'Address', 'Department', 'Created At'];
    const rows = issues.map((i) => [
      i.id,
      `"${i.title.replace(/"/g, '""')}"`,
      i.category,
      i.priority,
      i.status,
      `"${i.address.replace(/"/g, '""')}"`,
      i.assigned_department || 'unassigned',
      i.created_at,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `civicpulse_infrastructure_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-white py-16">
        <LoadingSpinner message="Aggregating municipal telemetry and SLA metrics..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-md bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-800 border border-teal-200">
                Civic Open Data & Performance
              </span>
              <span className="text-xs text-slate-400">• Real-Time PostgreSQL Telemetry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Infrastructure Resolution Analytics
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Transparent service-level agreement metrics, department throughput, and incident distribution.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              Export CSV Dataset
            </button>
            <button
              onClick={loadData}
              className="p-2.5 rounded-xl border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 transition"
              title="Refresh Analytics"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Tickets
              </span>
              <Layers className="h-4 w-4 text-slate-600" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{stats.totalIssues}</p>
            <p className="text-xs text-slate-500 mt-1">Logged community incidents</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Resolution Rate
              </span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-3xl font-extrabold text-emerald-600">
              {stats.resolutionRatePercent}%
            </p>
            <p className="text-xs text-slate-500 mt-1">{stats.resolved} of {stats.totalIssues} completed</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Average Resolution
              </span>
              <Clock className="h-4 w-4 text-teal-600" />
            </div>
            <p className="text-3xl font-extrabold text-teal-700">
              {stats.avgResolutionDays} Days
            </p>
            <p className="text-xs text-slate-500 mt-1">Municipal target &lt; 3.0 days</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Active Hazards
              </span>
              <AlertTriangle className="h-4 w-4 text-rose-600" />
            </div>
            <p className="text-3xl font-extrabold text-rose-600">
              {stats.urgentIssues}
            </p>
            <p className="text-xs text-slate-500 mt-1">Urgent safety priority</p>
          </div>
        </div>

        {/* Charts Grid Row 1: Weekly Volume Trends + Status Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Inflow Area Chart */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Weekly Intake vs. Completed Repairs
                </h3>
                <p className="text-xs text-slate-500">
                  Citizen reports inflow tracked against field crew closure velocity
                </p>
              </div>
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                Last 5 Weeks
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.weeklyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0F172A" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#0F172A" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#CBD5E1" />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} stroke="#CBD5E1" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Area
                    type="monotone"
                    dataKey="reported"
                    name="Reports Received"
                    stroke="#0F172A"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorReported)"
                  />
                  <Area
                    type="monotone"
                    dataKey="resolved"
                    name="Repairs Resolved"
                    stroke="#0D9488"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorResolved)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Donut Distribution */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Status Distribution
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Active municipal lifecycle breakdown
              </p>
            </div>

            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.statusDistribution}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {stats.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-4 border-t border-slate-100">
              {stats.statusDistribution.map((s) => (
                <div key={s.status} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-slate-600">{s.label}: <strong>{s.count}</strong></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Grid Row 2: Category Bar Chart & Department Throughput */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Bar Chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Incidents by Infrastructure Category
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Volume comparison across municipal asset types
            </p>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.categoryDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="label" 
                    tick={{ fontSize: 10, fill: '#64748B' }} 
                    stroke="#CBD5E1" 
                    angle={-25} 
                    textAnchor="end" 
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} stroke="#CBD5E1" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" name="Total Reports" fill="#0D9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department Performance Table */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Department Throughput & Average Turnaround
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Benchmarked against city charter target SLAs
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="pb-2">Agency / Division</th>
                    <th className="pb-2 text-center">Open Cases</th>
                    <th className="pb-2 text-center">Completed</th>
                    <th className="pb-2 text-right">Avg SLA (Days)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.departmentPerformance.map((dept) => (
                    <tr key={dept.department} className="hover:bg-slate-50">
                      <td className="py-3 font-semibold text-slate-800 flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 text-teal-600" />
                        {dept.department}
                      </td>
                      <td className="py-3 text-center text-amber-700 font-medium">
                        {dept.open}
                      </td>
                      <td className="py-3 text-center text-emerald-700 font-medium">
                        {dept.resolved}
                      </td>
                      <td className="py-3 text-right font-bold text-slate-900">
                        {dept.avgDays} d
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500 border border-slate-100">
              * Average SLA is measured from citizen submission timestamp to final supervisor verification and public photo upload.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
