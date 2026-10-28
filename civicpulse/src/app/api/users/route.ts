import { NextRequest, NextResponse } from 'next/server';
import { mongoGetUsers, mongoCreateUser } from '@/lib/mongodb';

// GET /api/users - List all users from MongoDB
export async function GET() {
  try {
    const users = await mongoGetUsers();
    return NextResponse.json({ success: true, count: users.length, users });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch users from MongoDB' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create a new user in MongoDB
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || !body.email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required fields (Error 400 Bad Request)' },
        { status: 400 }
      );
    }
    const newUser = await mongoCreateUser({
      name: body.name,
      email: body.email,
      role: body.role || 'citizen',
      neighborhood: body.neighborhood,
      phone: body.phone,
    });
    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create user in MongoDB' },
      { status: 500 }
    );
  }
}
