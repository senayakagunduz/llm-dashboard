// create-admin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  try {
    // MongoDB bağlantısı
    await mongoose.connect('mongodb://admin:admin123@localhost:27017/llm-monitoring?authSource=admin');
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const user = {
      email: "admin@arcelik.com",
      password: hashedPassword,
      fullname: "Admin",
      role: "admin",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const db = mongoose.connection.db;
    const result = await db.collection('users').insertOne(user);
    console.log('Admin kullanıcısı oluşturuldu:', result.ops);
    
    process.exit(0);
  } catch (error) {
    console.error('Hata:', error);
    process.exit(1);
  }
}

createAdmin();