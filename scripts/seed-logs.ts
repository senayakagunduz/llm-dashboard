import mongoose from 'mongoose';
import { connectDB } from '../lib/db';
import { Log } from '../models/Log';

async function seedLogs() {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('Connected to MongoDB');

    // Sample log data
    const logData1 = {
      id: 'log1',
      question: 'Merhaba, nasıl yardımcı olabilirim?',
      answer: 'Merhaba! Size yardımcı olmaktan memnuniyet duyarım.',
      userId: 'user123',
      sessionId: 'session456',
      timestamp: new Date().toISOString(),
      responseTime: 1500,
      model: 'gpt-3.5',
      tokensUsed: 150,
      status: 'completed',
      completedAt: new Date().toISOString()
    };

    const logData2 = {
      id: 'log2',
      question: 'Bugün hava nasıl?',
      answer: 'Malesef gerçek zamanlı hava durumu bilgisine sahip değilim. Lütfen bir hava durumu uygulamasına bakın.',
      userId: 'user124',
      sessionId: 'session457',
      timestamp: new Date().toISOString(),
      responseTime: 2200,
      model: 'gpt-3.5',
      tokensUsed: 200,
      status: 'completed',
      completedAt: new Date().toISOString()
    };

    const logData3 = {
      id: 'log3',
      question: 'Sistem nasıl çalışır?',
      answer: 'Sistem, kullanıcı sorularını AI modeli ile cevaplar ve tüm etkileşimleri loglar.',
      userId: 'user125',
      sessionId: 'session458',
      timestamp: new Date().toISOString(),
      responseTime: 1800,
      model: 'gpt-3.5',
      tokensUsed: 175,
      status: 'completed',
      completedAt: new Date().toISOString()
    };

    // Check if logs already exist
    const existingLogs = await Log.find({});
    const existingLogIds = existingLogs.map(log => log.id);
    const newLogs = [logData1, logData2, logData3].filter(
      log => !existingLogIds.includes(log.id)
    );

    if (newLogs.length > 0) {
      // Save new logs
      await Log.insertMany(newLogs);
      console.log(`Successfully added ${newLogs.length} new logs`);
    } else {
      console.log('All logs already exist in the database');
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding logs:', error);
    process.exit(1);
  }
}

// Run the script
seedLogs();
