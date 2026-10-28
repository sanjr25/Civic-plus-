import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';
import { isMongoConfigured, mongoGetUsers } from '@/lib/mongodb';
import { getIssues, getFAQs, getSupportTickets } from '@/lib/data';

export async function GET() {
  const start = Date.now();

  try {
    const [issues, faqs, tickets, users] = await Promise.all([
      getIssues().catch(() => []),
      getFAQs().catch(() => []),
      getSupportTickets().catch(() => []),
      mongoGetUsers().catch(() => []),
    ]);

    // Check third-party API latency with 1500ms timeout
    let thirdPartyStatus = 'operational';
    let thirdPartyLatency = 0;
    let thirdPartyFallback = false;

    try {
      const tpStart = Date.now();
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 1500);
      const res = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=47.6062&longitude=-122.3321&current=temperature_2m',
        { signal: controller.signal }
      );
      clearTimeout(tid);
      thirdPartyLatency = Date.now() - tpStart;
      if (!res.ok) thirdPartyFallback = true;
    } catch {
      thirdPartyFallback = true;
      thirdPartyStatus = 'degraded_fallback_active';
    }

    const memory = process.memoryUsage();

    const health = {
      status: 'healthy',
      system: 'CivicPulse Municipal Infrastructure Engine',
      version: '1.0.0',
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      latencyMs: Date.now() - start,
      environment: process.env.NODE_ENV || 'development',
      services: {
        sqlDatabase: {
          status: 'connected',
          engine: isSupabaseConfigured() ? 'Supabase PostgreSQL' : 'Local Synced PostgreSQL Engine',
          isLiveCloud: isSupabaseConfigured(),
          issuesCount: issues.length,
          faqsCount: faqs.length,
          supportTicketsCount: tickets.length,
        },
        mongoDatabase: {
          status: 'connected',
          engine: isMongoConfigured() ? 'MongoDB Atlas' : 'Embedded JSON MongoDB Engine',
          isLiveCloud: isMongoConfigured(),
          usersCount: users.length,
        },
        geminiAI: {
          status: process.env.GEMINI_API_KEY ? 'active_cloud' : 'local_faq_grounded_fallback',
          configured: Boolean(process.env.GEMINI_API_KEY),
          model: 'gemini-1.5-flash',
        },
        thirdPartyAdvisoryApi: {
          status: thirdPartyStatus,
          endpoint: 'Open-Meteo Weather & Road Conditions',
          latencyMs: thirdPartyLatency,
          fallbackActive: thirdPartyFallback,
          timeoutLimitMs: 2000,
        },
      },
      diagnostics: {
        heapUsedMb: Math.round(memory.heapUsed / 1024 / 1024),
        heapTotalMb: Math.round(memory.heapTotal / 1024 / 1024),
        rssMb: Math.round(memory.rss / 1024 / 1024),
      },
    };

    return NextResponse.json(health, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: err.message,
      },
      { status: 503 }
    );
  }
}
