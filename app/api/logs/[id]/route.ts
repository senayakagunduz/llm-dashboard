import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/db';
import { Log } from '@/models/Log';
import { authOptions } from '@/lib/auth';

interface Params {
  params: {
    id: string;
  };
}

export async function DELETE(
  request: Request,
  { params }: Params
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (session?.user?.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await connectDB();
    
    const deletedLog = await Log.findByIdAndDelete(params.id);
    
    if (!deletedLog) {
      return new NextResponse('Log not found', { status: 404 });
    }

    return NextResponse.json({ success: true, data: deletedLog });
  } catch (error) {
    console.error('Error deleting log:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
