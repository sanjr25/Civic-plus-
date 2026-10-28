import { NextRequest, NextResponse } from 'next/server';
import { mongoSaveChatLog, mongoGetChatLogs } from '@/lib/mongodb';

// GET /api/chat/logs - Retrieve chat history from MongoDB
export async function GET() {
  try {
    const logs = await mongoGetChatLogs();
    return NextResponse.json({ success: true, count: logs.length, logs });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/chat/logs - Store chat log in MongoDB
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.sessionId || !body.messages) {
      return NextResponse.json(
        { success: false, error: 'sessionId and messages array are required' },
        { status: 400 }
      );
    }
    const saved = await mongoSaveChatLog(body);
    return NextResponse.json({ success: true, log: saved }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
