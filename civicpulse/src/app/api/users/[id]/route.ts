import { NextRequest, NextResponse } from 'next/server';
import { mongoGetUserById, mongoUpdateUser, mongoDeleteUser } from '@/lib/mongodb';

// GET /api/users/[id] - Read user by ID
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await mongoGetUserById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: `User with id ${id} not found (Error 404)` },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT /api/users/[id] - Update user by ID
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const updated = await mongoUpdateUser(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: `User with id ${id} not found for update (Error 404)` },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, user: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE /api/users/[id] - Delete user by ID
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const deleted = await mongoDeleteUser(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: `User with id ${id} not found for deletion (Error 404)` },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, message: `User ${id} successfully removed from MongoDB` });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
