import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();

    // Admin hesap kontrolü
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (!existingAdmin) {
      // İlk admin hesap oluşturma
      const admin = new User({
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        password: 'admin123'  // Bu şifre daha sonra değiştirilebilir
      });

      await admin.save();
      console.log('Admin hesap oluşturuldu!');
      
      return NextResponse.json({
        success: true,
        message: 'Admin hesap başarıyla oluşturuldu'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Admin hesap zaten mevcut'
    });
  } catch (error) {
    console.error('Admin hesap oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Admin hesap oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}
