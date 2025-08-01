import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Admin kontrolü
    const adminEmail = request.headers.get('x-email');
    if (adminEmail) {
      const admin = await User.findOne({ email: adminEmail, role: 'admin' });
      if (!admin) {
        return NextResponse.json(
          { success: false, message: 'Admin access required' },
          { status: 403 }
        );
      }
    }
    
    const users = await User.find({}).select('-password');
    
    return NextResponse.json({ 
      success: true, 
      data: users 
    });
    
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Error fetching users' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    const adminEmail = request.headers.get('x-email');
    if (adminEmail) {
      const admin = await User.findOne({ email: adminEmail, role: 'admin' });
      if (!admin) {
        return NextResponse.json(
          { success: false, message: 'Admin access required' },
          { status: 403 }
        );
      }
    }

    const updateData = await request.json();
    
    // Hash password if provided
    if (updateData.password) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'User updated successfully',
      data: updatedUser 
    });

  } catch (error) {
    console.error('PUT users error:', error);
    return NextResponse.json(
      { success: false, message: 'Error updating user' },
      { status: 500 }
    );
  }
}