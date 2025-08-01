import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB();
    
    const { userId } = await params;
    
    // Soft delete - deactivate user
    const deletedUser = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true, select: '-password' }
    );

    if (!deletedUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'User deactivated successfully' 
    });

  } catch (error) {
    console.error('DELETE user error:', error);
    return NextResponse.json(
      { success: false, message: 'Error deleting user' },
      { status: 500 }
    );
  }
}