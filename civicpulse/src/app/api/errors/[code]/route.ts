import { NextRequest, NextResponse } from 'next/server';
import { ERROR_CODES } from '@/lib/error-data';

// GET /api/errors/[code] - Demonstrates and triggers the specific HTTP error code
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const numCode = parseInt(code, 10);
  const errorInfo = ERROR_CODES[numCode];

  if (!errorInfo) {
    return NextResponse.json(
      { error: `Unknown error code: ${code}. Supported: 400, 401, 403, 404, 422, 429, 500, 503` },
      { status: 400 }
    );
  }

  // Return the actual HTTP status with the structured diagnostic payload
  return NextResponse.json(
    {
      success: false,
      statusCode: numCode,
      name: errorInfo.name,
      title: errorInfo.title,
      description: errorInfo.description,
      cause: errorInfo.cause,
      solution: errorInfo.solution,
      isSiteSpecific: Boolean(errorInfo.isSiteSpecific),
      timestamp: new Date().toISOString(),
    },
    { status: numCode }
  );
}
