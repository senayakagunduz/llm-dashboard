import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Log } from '@/models/Log';

export async function POST(request: Request) {
  try {
    // Veritabanına bağlan
    await connectDB();

    // Örnek log verileri
    const logData1 = {
      requestId: 'req_' + Date.now(),
      applianceId: 'T999927528921570060524',
      sessionId: 'sess_' + Date.now(),
      deviceUDID: '0d3b60cc4328e606',
      homeId: '746972',
      prompt: 'Kurutma makinesi çalıştır',
      response: 'Kurutma makinesi başlatılıyor',
      skuNumber: 'ABC123',
      timestamp: new Date()
    };

    const logData2 = {
      requestId: 'req_' + (Date.now() + 1),
      applianceId: 'T999927528921570060525',
      sessionId: 'sess_' + (Date.now() + 1),
      deviceUDID: '1e4c71dd5439f717',
      homeId: '746973',
      prompt: 'Buzdolabı sıcaklığını ayarla',
      response: 'Buzdolabı sıcaklığı 4°C olarak ayarlandı',
      skuNumber: 'DEF456',
      timestamp: new Date()
    };

    const logData3 = {
      requestId: 'req_' + (Date.now() + 2),
      applianceId: 'T999927528921570060526',
      sessionId: 'sess_' + (Date.now() + 2),
      deviceUDID: '2f5d82ee6540a828',
      homeId: '746974',
      prompt: 'Çamaşır makinesi programını değiştir',
      response: 'Çamaşır makinesi programı pamuklu 40°C olarak ayarlandı',
      skuNumber: 'GHI789',
      timestamp: new Date()
    };

    // Önce veritabanında aynı id'ye sahip log var mı kontrol et
    const existingLogs = await Log.find({});
    
    // Yeni log verilerini sakla
    const newLogs = [logData1, logData2, logData3];
    
    // Mevcut loglara bakarak yeni logları filtrele
    const logsToSave = newLogs.filter(log => 
      !existingLogs.some(existingLog => existingLog.requestId === log.requestId)
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
