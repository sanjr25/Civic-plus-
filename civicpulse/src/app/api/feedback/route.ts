import { NextRequest, NextResponse } from 'next/server';
import { mongoSaveFeedback, mongoGetFeedback } from '@/lib/mongodb';

// GET /api/feedback - Retrieve feedback items from MongoDB
export async function GET() {
  try {
    const feedbackList = await mongoGetFeedback();
    return NextResponse.json({ success: true, count: feedbackList.length, feedback: feedbackList });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/feedback - Store user feedback in MongoDB
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.comment && !body.rating) {
      return NextResponse.json(
        { success: false, error: 'Rating or comment is required for feedback submission' },
        { status: 400 }
      );
    }
    const saved = await mongoSaveFeedback({
      userEmail: body.userEmail || 'anonymous',
      rating: Number(body.rating) || 5,
      category: body.category || 'ai_assistant',
      comment: body.comment || 'Helpful response',
      pageUrl: body.pageUrl || '/',
    });
    return NextResponse.json({ success: true, feedback: saved }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
