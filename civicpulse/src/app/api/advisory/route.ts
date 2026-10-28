import { NextResponse } from 'next/server';

export interface MunicipalAdvisory {
  temperatureC: number;
  temperatureF: number;
  condition: string;
  roadStatus: 'clear' | 'caution' | 'hazardous';
  advisoryText: string;
  source: 'open_meteo_live' | 'cached_fallback';
  latencyMs: number;
  timestamp: string;
  isFallback: boolean;
}

const FALLBACK_ADVISORY: Omit<MunicipalAdvisory, 'latencyMs' | 'timestamp'> = {
  temperatureC: 14.5,
  temperatureF: 58.1,
  condition: 'Overcast / Mild',
  roadStatus: 'clear',
  advisoryText: 'Standard operating conditions across all city transit corridors. No active ice, flood, or high-wind hazard warnings.',
  source: 'cached_fallback',
  isFallback: true,
};

// GET /api/advisory - Third-party API with strict 2000ms timeout and cached fallback
export async function GET() {
  const start = Date.now();
  const TIMEOUT_MS = 2000;

  try {
    // 2-second timeout using AbortSignal
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=47.6062&longitude=-122.3321&current=temperature_2m,precipitation,weather_code,wind_speed_10m',
      {
        signal: controller.signal,
        headers: { 'User-Agent': 'CivicPulse-Municipal-Advisory/1.0' },
      }
    );

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - start;

    if (!res.ok) {
      throw new Error(`External API responded with status ${res.status}`);
    }

    const data = await res.json();
    const current = data.current || {};
    const tempC = current.temperature_2m ?? 14;
    const tempF = Math.round((tempC * 9) / 5 + 32);
    const windKmh = current.wind_speed_10m ?? 8;
    const rainMm = current.precipitation ?? 0;

    let roadStatus: 'clear' | 'caution' | 'hazardous' = 'clear';
    let condition = 'Dry / Clear';
    let advisoryText = 'Normal pavement friction. City streets clear for regular transit and cycling.';

    if (rainMm > 2.0 || windKmh > 35) {
      roadStatus = 'caution';
      condition = 'Wet Pavement / Moderate Wind';
      advisoryText = 'Reduced traction reported on arterial hills. Exercise caution around storm grates and bike corridors.';
    }

    const advisory: MunicipalAdvisory = {
      temperatureC: tempC,
      temperatureF: tempF,
      condition,
      roadStatus,
      advisoryText,
      source: 'open_meteo_live',
      latencyMs,
      timestamp: new Date().toISOString(),
      isFallback: false,
    };

    return NextResponse.json({ success: true, advisory });
  } catch (err: any) {
    const latencyMs = Date.now() - start;
    console.warn(`Third-party weather API timed out or failed (${latencyMs}ms): ${err.message}. Triggering fallback.`);

    const fallback: MunicipalAdvisory = {
      ...FALLBACK_ADVISORY,
      latencyMs,
      timestamp: new Date().toISOString(),
      isFallback: true,
    };

    return NextResponse.json({
      success: true,
      advisory: fallback,
      fallbackReason: err.name === 'AbortError' ? 'Time limit exceeded (>2000ms)' : err.message,
    });
  }
}
