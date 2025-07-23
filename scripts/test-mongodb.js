const mongoose = require('mongoose');

// Connection URI - same as in your db.ts
const MONGODB_URI = 'mongodb://admin:Sa123456@localhost:27017/llm-monitoring?authSource=admin&retryWrites=true&w=majority';

async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    
    const connection = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Successfully connected to MongoDB');
    
    // List all collections to verify access
    const collections = await connection.connection.db.listCollections().toArray();
    console.log('\nAvailable collections:');
    collections.forEach((collection) => {
      console.log(`- ${collection.name}`);
    });
    
    // Close the connection
    await mongoose.disconnect();
    console.log('\n✅ Connection closed');
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    
    // More detailed error information
    if (error.name === 'MongoServerError') {
      console.error('\n🔍 Error details:', {
        code: error.code,
        codeName: error.codeName,
        errorLabels: error.errorLabels,
      });
      
      if (error.code === 18) {
        console.error('\n🔑 Authentication failed. Please check your username and password.');
      }
    }
    
    process.exit(1);
  }
}

testConnection();
