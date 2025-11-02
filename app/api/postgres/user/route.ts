import { NextRequest, NextResponse } from 'next/server';

import { createUserIfNotExist, getUserById } from '@/app/src/service/users/usersService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || '4';

    if (!userId) {
      return new NextResponse(JSON.stringify({ error: 'User ID is required' }), { status: 400 });
    }

    const parsedUserId = Number(userId);

    if (isNaN(parsedUserId)) {
      return new NextResponse(JSON.stringify({ error: 'User ID must be a valid number' }), {
        status: 400,
      });
    }

    const queryHistory = await getUserById(parsedUserId);
    return NextResponse.json(queryHistory);
  } catch (error) {
    if (error instanceof Error && error.message === 'User not found') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'User check failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username) {
      return new NextResponse(JSON.stringify({ error: 'Username is required' }), { status: 400 });
    }

    const queryHistory = await createUserIfNotExist(username);
    return NextResponse.json(queryHistory);
  } catch (error) {
    return NextResponse.json({ error: 'User check failed' }, { status: 500 });
  }
}
