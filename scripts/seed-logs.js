const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://senayakgndz_db_user:admin123@cluster0.opjmaz4.mongodb.net/llm-monitoring?retryWrites=true&w=majority';
const DATABASE_NAME = 'llm-monitoring';

const now = Date.now();
const day = 24 * 60 * 60 * 1000;

const sampleLogs = [
  {
    requestId: 'req_' + (now - 1 * day),
    applianceId: 'T999927528921570060524',
    sessionId: 'sess_001',
    deviceUDID: '0d3b60cc4328e606',
    homeId: '746972',
    prompt: 'Kurutma makinesi çalıştır',
    response: 'Kurutma makinesi başlatılıyor',
    skuNumber: 'ABC123',
    timestamp: new Date(now - 1 * day),
    responseTime: 1000,
  },
  {
    requestId: 'req_' + (now - 2 * day),
    applianceId: 'T999927528921570060525',
    sessionId: 'sess_001',
    deviceUDID: '1e4c71dd5439f717',
    homeId: '746972',
    prompt: 'Buzdolabı sıcaklığını ayarla',
    response: 'Buzdolabı sıcaklığı 4°C olarak ayarlandı',
    skuNumber: 'DEF456',
    timestamp: new Date(now - 2 * day),
    responseTime: 500,
  },
  {
    requestId: 'req_' + (now - 3 * day),
    applianceId: 'T999927528921570060526',
    sessionId: 'sess_002',
    deviceUDID: '2f5d82ee6540a828',
    homeId: '746973',
    prompt: 'Çamaşır makinesi programını değiştir',
    response: 'Çamaşır makinesi programı pamuklu 40°C olarak ayarlandı',
    skuNumber: 'GHI789',
    timestamp: new Date(now - 3 * day),
    responseTime: 1500,
  },
  {
    requestId: 'req_' + (now - 4 * day),
    applianceId: 'T999927528921570060527',
    sessionId: 'sess_002',
    deviceUDID: '2f5d82ee6540a828',
    homeId: '746973',
    prompt: 'Fırın sıcaklığını 180 derece yap',
    response: 'Fırın sıcaklığı 180°C olarak ayarlandı',
    skuNumber: 'JKL012',
    timestamp: new Date(now - 4 * day),
    responseTime: 800,
  },
  {
    requestId: 'req_' + (now - 5 * day),
    applianceId: 'T999927528921570060528',
    sessionId: 'sess_003',
    deviceUDID: '3a6e93ff7651b939',
    homeId: '746974',
    prompt: 'Bulaşık makinesini aç',
    response: 'Bulaşık makinesi başlatıldı, Ekonomi programı seçildi',
    skuNumber: 'MNO345',
    timestamp: new Date(now - 5 * day),
    responseTime: 1200,
  },
  {
    requestId: 'req_' + (now - 6 * day),
    applianceId: 'T999927528921570060529',
    sessionId: 'sess_003',
    deviceUDID: '3a6e93ff7651b939',
    homeId: '746974',
    prompt: 'Klimayı kapat',
    response: 'Klima kapatıldı',
    skuNumber: 'PQR678',
    timestamp: new Date(now - 6 * day),
    responseTime: 300,
  },
  {
    requestId: 'req_' + (now - 7 * day),
    applianceId: 'T999927528921570060530',
    sessionId: 'sess_004',
    deviceUDID: '4b7fa4ee8762ca40',
    homeId: '746975',
    prompt: 'Şarap soğutucusunun sıcaklığını kontrol et',
    response: 'Şarap soğutucu sıcaklığı 12°C olarak ayarlandı',
    skuNumber: 'STU901',
    timestamp: new Date(now - 7 * day),
    responseTime: 600,
  },
  {
    requestId: 'req_' + (now - 8 * day),
    applianceId: 'T999927528921570060531',
    sessionId: 'sess_004',
    deviceUDID: '4b7fa4ee8762ca40',
    homeId: '746975',
    prompt: 'Mikrodalga fırını 2 dakika aç',
    response: 'Mikrodalga fırını 2 dakika boyunca ısıtma başlatıldı',
    skuNumber: 'VWX234',
    timestamp: new Date(now - 8 * day),
    responseTime: 2000,
  },
  {
    requestId: 'req_' + (now - 9 * day),
    applianceId: 'T999927528921570060532',
    sessionId: 'sess_005',
    deviceUDID: '5c8ab5ff9873db51',
    homeId: '746976',
    prompt: 'Türk kahvesi makinesini çalıştır',
    response: 'Türk kahvesi makinesi çalışıyor, 2 fincan kahve hazırlanıyor',
    skuNumber: 'YZA567',
    timestamp: new Date(now - 9 * day),
    responseTime: 1800,
  },
  {
    requestId: 'req_' + (now - 10 * day),
    applianceId: 'T999927528921570060533',
    sessionId: 'sess_005',
    deviceUDID: '5c8ab5ff9873db51',
    homeId: '746976',
    prompt: 'Elektrikli süpürgeyi başlat',
    response: 'Elektrikli süpürge başlatıldı, Auto mod seçildi',
    skuNumber: 'BCD890',
    timestamp: new Date(now - 10 * day),
    responseTime: 700,
  },
  {
    requestId: 'req_' + (now - 11 * day),
    applianceId: 'T999927528921570060534',
    sessionId: 'sess_006',
    deviceUDID: '6d9bc6aa0984ec62',
    homeId: '746977',
    prompt: 'Akıllı ampulü mavi yap',
    response: 'Akıllı ampul rengi mavi olarak değiştirildi',
    skuNumber: 'EFG123',
    timestamp: new Date(now - 11 * day),
    responseTime: 400,
  },
  {
    requestId: 'req_' + (now - 12 * day),
    applianceId: 'T999927528921570060535',
    sessionId: 'sess_006',
    deviceUDID: '6d9bc6aa0984ec62',
    homeId: '746977',
    prompt: 'Garaj kapısını aç',
    response: 'Garaj kapısı açılıyor...',
    skuNumber: 'HIJ456',
    timestamp: new Date(now - 12 * day),
    responseTime: 2500,
  },
  {
    requestId: 'req_' + (now - 13 * day),
    applianceId: 'T999927528921570060536',
    sessionId: 'sess_007',
    deviceUDID: '7eacd7bb1095fd73',
    homeId: '746978',
    prompt: 'Su ısıtıcısını 90 dereceye ayarla',
    response: 'Su ısıtıcısı 90°C olarak ayarlandı',
    skuNumber: 'KLM789',
    timestamp: new Date(now - 13 * day),
    responseTime: 900,
  },
  {
    requestId: 'req_' + (now - 14 * day),
    applianceId: 'T999927528921570060537',
    sessionId: 'sess_007',
    deviceUDID: '7eacd7bb1095fd73',
    homeId: '746978',
    prompt: 'Oda sıcaklığını kontrol et',
    response: 'Oda sıcaklığı şu anda 23°C',
    skuNumber: 'NOP012',
    timestamp: new Date(now - 14 * day),
    responseTime: 350,
  },
  {
    requestId: 'req_' + (now - 15 * day),
    applianceId: 'T999927528921570060538',
    sessionId: 'sess_008',
    deviceUDID: '8fbde8cc2106ge84',
    homeId: '746979',
    prompt: 'Çamaşır kurutma makinesinin kalan süresini söyle',
    response: 'Çamaşır kurutma makinesinde 45 dakika süre kaldı',
    skuNumber: 'QRS345',
    timestamp: new Date(now - 15 * day),
    responseTime: 550,
  },
  {
    requestId: 'req_' + (now - 16 * day),
    applianceId: 'T999927528921570060539',
    sessionId: 'sess_008',
    deviceUDID: '8fbde8cc2106ge84',
    homeId: '746979',
    prompt: 'Akıllı prize hangi cihaz bağlı',
    response: 'Akıllı prize ütü bağlı ve şu anda açık durumda',
    skuNumber: 'TUV678',
    timestamp: new Date(now - 16 * day),
    responseTime: 450,
  },
  {
    requestId: 'req_' + (now - 17 * day),
    applianceId: 'T999927528921570060540',
    sessionId: 'sess_009',
    deviceUDID: '9gcef9dd3217hf95',
    homeId: '746980',
    prompt: 'Merkezi ısıtma sistemini 21 dereceye ayarla',
    response: 'Merkezi ısıtma sistemi 21°C olarak ayarlandı',
    skuNumber: 'WXY901',
    timestamp: new Date(now - 17 * day),
    responseTime: 1100,
  },
  {
    requestId: 'req_' + (now - 18 * day),
    applianceId: 'T999927528921570060541',
    sessionId: 'sess_009',
    deviceUDID: '9gcef9dd3217hf95',
    homeId: '746980',
    prompt: 'Güneşlikleri yukarı kaldır',
    response: 'Güneşlikler yukarı kaldırıldı',
    skuNumber: 'ZAB234',
    timestamp: new Date(now - 18 * day),
    responseTime: 1500,
  },
  {
    requestId: 'req_' + (now - 19 * day),
    applianceId: 'T999927528921570060542',
    sessionId: 'sess_010',
    deviceUDID: '0hdf0ee4328ig06',
    homeId: '746981',
    prompt: 'Smoke detector durumunu kontrol et',
    response: 'Smoke detector aktif ve sorunsuz çalışıyor, pil seviyesi %95',
    skuNumber: 'CDE567',
    timestamp: new Date(now - 19 * day),
    responseTime: 650,
  },
  {
    requestId: 'req_' + (now - 20 * day),
    applianceId: 'T999927528921570060543',
    sessionId: 'sess_010',
    deviceUDID: '0hdf0ee4328ig06',
    homeId: '746981',
    prompt: 'Akıllı kilidi aç',
    response: 'Akıllı kilit açıldı, kapıyı açabilirsiniz',
    skuNumber: 'FGH890',
    timestamp: new Date(now - 20 * day),
    responseTime: 850,
  },
];

async function connectToMongoDB() {
  try {
    console.log('MongoDB\'ye baglaniliyor...');
    const client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    await client.connect();
    console.log('? MongoDB baglantisi basarili!');
    return client;
  } catch (error) {
    console.error('? MongoDB baglanti hatasi:', error);
    throw error;
  }
}

async function insertLogs(client, logs) {
  try {
    const db = client.db(DATABASE_NAME);
    const collection = db.collection('logs');

    console.log(`${logs.length} adet log kaydi ekleniyor...`);

    // Var olan loglari kontrol etmek icin requestId'leri cekiyoruz
    const existingLogs = await collection.find({ requestId: { $in: logs.map(l => l.requestId) } }).toArray();
    const existingRequestIds = existingLogs.map(l => l.requestId);

    const newLogs = logs.filter(log => !existingRequestIds.includes(log.requestId));

    if (newLogs.length === 0) {
      console.log('Eklenebilecek yeni log yok.');
      return;
    }

    const result = await collection.insertMany(newLogs);

    console.log(`? ${result.insertedCount} adet log basariyla eklendi!`);
    console.log('Eklenen ID\'ler:', Object.values(result.insertedIds));

    return result;
  } catch (error) {
    console.error('? Log ekleme hatasi:', error);
    throw error;
  }
}

async function createIndexes(client) {
  try {
    const db = client.db(DATABASE_NAME);
    const collection = db.collection('logs');

    await collection.createIndex({ timestamp: -1 });
    await collection.createIndex({ userId: 1 });
    await collection.createIndex({ sessionId: 1 });
    await collection.createIndex({ status: 1 });

    console.log('? Indexler olusturuldu.');
  } catch (error) {
    console.error('? Index olusturma hatasi:', error);
  }
}
async function verifyLogs(client) {
  try {
    const db = client.db(DATABASE_NAME);
    const collection = db.collection('logs');

    const count = await collection.countDocuments();
    console.log(`?? Toplam log sayisi: ${count}`);

    const recentLogs = await collection
      .find({})
      .sort({ timestamp: -1 })
      .limit(5)
      .toArray();

    console.log('?? Son eklenen loglar:');
    recentLogs.forEach((log, i) => {
      console.log(`${i + 1}. [${log.applianceId}] ${log.prompt?.substring(0, 40)}...`);
    });
  } catch (error) {
    console.error('? Log dogrulama hatasi:', error);
  }
}
async function main() {
  let client;
  
  try {
    console.log('?? Log ekleme script\'i baslatiliyor...\n');
    
    client = await connectToMongoDB();
    
    await createIndexes(client);
    
    await insertLogs(client, sampleLogs);
    
    await verifyLogs(client);
    
    console.log('\n? Script basariyla tamamlandi!');
  } catch (error) {
    console.error('\n? Script hatasi:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('?? MongoDB baglantisi kapatildi.');
    }
  }
}

if (require.main === module) {
  main();
}

module.exports = { insertLogs, connectToMongoDB };
