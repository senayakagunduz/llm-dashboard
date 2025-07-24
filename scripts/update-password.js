// update-password.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function updatePassword() {
  try {
    await mongoose.connect('mongodb://admin:admin123@localhost:27017/llm-monitoring?authSource=admin');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const db = mongoose.connection.db;
    const result = await db.collection('users').updateOne(
      { email: "admin@arcelik.com" },
      { $set: { password: hashedPassword } }
    );
    
    console.log('Şifre güncellendi:', result);
    process.exit(0);
  } catch (error) {
    console.error('Hata:', error);
    process.exit(1);
  }
}

updatePassword();