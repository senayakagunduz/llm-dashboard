import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (session) {
      // Clear the session
      return NextResponse.json(
        { message: 'Successfully logged out' },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: 'No active session found' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed. Please try again.' },
      { status: 500 }
    );
  }
}
