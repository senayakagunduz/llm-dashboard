import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
  try {
    await connectDB();
    
    const { userId, adminEmail } = await request.json();

    // Check if requester is admin
    const admin = await User.findOne({ email: adminEmail, role: 'admin' });
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Only admins can delete users' },
        { status: 403 }
      );
    }

    // Check if target user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Prevent deleting admin users
    if (targetUser.role === 'admin') {
      // Check if admin is trying to delete themselves
      if (targetUser.email === adminEmail) {
        return NextResponse.json(
          { success: false, message: 'You cannot delete your own admin account' },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { success: false, message: 'Cannot delete admin users' },
        { status: 403 }
      );
    }

    // Delete the user from the database
    await User.findByIdAndDelete(userId);
    
    return NextResponse.json(
      { success: true, message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (err) {
    console.error('Error in delete user:', err);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// Export other HTTP methods with 405 Method Not Allowed
export async function GET() {
  return new Response(null, { status: 405 });
}

export async function POST() {
  return new Response(null, { status: 405 });
}

export async function PUT() {
  return new Response(null, { status: 405 });
}

export async function PATCH() {
  return new Response(null, { status: 405 });
}
