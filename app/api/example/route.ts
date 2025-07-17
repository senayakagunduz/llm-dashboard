import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Log } from '@/models/Log';

export async function POST(request: Request) {
  try {
    // Veritabanına bağlan
    await connectToDatabase();

    // Örnek log verileri
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
      question: 'Bu sorunun çözümü nedir?',
      answer: 'Bu sorunun çözümü şunlar olabilir: 1) X, 2) Y, 3) Z',
      userId: 'user124',
      sessionId: 'session457',
      timestamp: new Date().toISOString(),
      responseTime: 2000,
      model: 'gpt-4',
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

    // Önce veritabanında aynı id'ye sahip log var mı kontrol et
    const existingLogs = await Log.find({});
    
    // Yeni log verilerini sakla
    const newLogs = [logData1, logData2, logData3];
    
    // Mevcut loglara bakarak yeni logları filtrele
    const logsToSave = newLogs.filter(log => 
      !existingLogs.some(existingLog => existingLog.id === log.id)
    );
    
    // Yeni logları kaydet
    if (logsToSave.length > 0) {
      const logs = logsToSave.map(log => new Log(log));
      await Promise.all(logs.map(log => log.save()));
    } else {
      console.log('No new logs to save. All logs already exist.');
    }

    return NextResponse.json({
      success: true,
      message: 'Log is saved successfully',
      data: logsToSave
    });

  } catch (error: unknown) {
    console.error('an error occurred while saving log:', error);
    return NextResponse.json({
      success: false,
      message: 'an error occurred while saving log',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
