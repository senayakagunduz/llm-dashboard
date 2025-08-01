import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });

    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: 'Admin already exists',
        email: existingAdmin.email
      });
    }

    // Create admin user
    const adminUser = new User({
      fullname: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123', // Will be hashed by the User model
      role: 'admin',
    });

    await adminUser.save();

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      email: 'admin@example.com',
      password: 'admin123'
    });
  } catch (error: any) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
