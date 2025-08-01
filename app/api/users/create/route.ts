import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  console.log('=== API ROUTE DEBUG ===');
  console.log('Method: POST');
  
  try {
    console.log('Connecting to database...');
    await connectDB();
    console.log('Database connected successfully');

    const body = await request.json();
    
    const { email, fullname, password, role, adminEmail } = body;
    console.log('Extracted fields:', { email, fullname, password: '***', role, adminEmail });
    
    const emaill = body.email?.trim();
    console.log("Sanitized email:", emaill);
    // Validate required fields
    if (!email || !fullname || !password) {
      console.log('Missing required fields');
      return NextResponse.json({ 
        success: false, 
        message: 'Email, fullname, and password are required' 
      }, { status: 400 });
    }

    // Admin validation
    console.log('Validating admin:', adminEmail);
    const admin = await User.findOne({ email: adminEmail, role: 'admin' });
    console.log('Admin found:', admin ? 'Yes' : 'No');
    
    if (!admin) {
      console.log('Admin validation failed');
      return NextResponse.json({ 
        success: false,
        message: 'Only admins can create users' 
      }, { status: 403 });
    }

    // Check if user already exists
    console.log('Checking if user exists:', email);
    const existing = await User.findOne({ email });
    console.log('Existing user found:', existing ? 'Yes' : 'No');
    
    if (existing) {
      console.log('User already exists');
      return NextResponse.json({ 
        success: false,
        message: 'User already exists' 
      }, { status: 409 });
    }

    // Create new user (password will be hashed automatically by the pre-save hook)
    console.log('Creating new user...');
    const newUser = new User({ 
      email, 
      fullname,
      password,
      role: role || 'user',
      isActive: true
    });
    
    console.log('User object created, saving to database...');
    await newUser.save();
    console.log('User saved successfully:', newUser._id);

    // Return user data without password
    const userResponse = {
      _id: newUser._id,
      fullname: newUser.fullname,
      email: newUser.email,
      role: newUser.role,
      isActive: newUser.isActive,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    };

    console.log('Sending success response:', userResponse);
    return NextResponse.json({ 
      success: true,
      message: 'User created successfully',
      data: userResponse
    }, { status: 201 });

  } catch (err) {
    const error = err as Error;
    console.error('=== API ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Log validation errors in more detail
    if (error.name === 'ValidationError') {
      const validationError = error as any;
      console.error('Validation errors:', validationError.errors);
    }
    
    // Log MongoDB duplicate key errors
    if (error.name === 'MongoServerError') {
      const mongoError = error as any;
      console.error('MongoDB error code:', mongoError.code);
      console.error('MongoDB error keyPattern:', mongoError.keyPattern);
      console.error('MongoDB error keyValue:', mongoError.keyValue);
    }
    
    return NextResponse.json({ 
      success: false,
      message: 'Error creating user',
      error: error.message,
      errorType: error.name,
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
        ...(error.name === 'ValidationError' && { validationErrors: (error as any).errors }),
        ...(error.name === 'MongoServerError' && { 
          code: (error as any).code,
          keyPattern: (error as any).keyPattern,
          keyValue: (error as any).keyValue
        })
      })
    }, { status: 500 });
  }
}