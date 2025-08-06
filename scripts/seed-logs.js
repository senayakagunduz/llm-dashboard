const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://admin:admin123@localhost:27017/llm-monitoring?authSource=admin';
const DATABASE_NAME = 'llm-monitoring';

const sampleLogs = [
  {
    requestId: 'req_' + Date.now(),
      applianceId: 'T999927528921570060524',
      sessionId: 'sess_' + Date.now(),
      deviceUDID: '0d3b60cc4328e606',
      homeId: '746972',
      prompt: 'Kurutma makinesi çalıştır',
      response: 'Kurutma makinesi başlatılıyor',
      skuNumber: 'ABC123',
      timestamp: new Date()
  },
  {
    requestId: 'req_' + (Date.now() + 1),
      applianceId: 'T999927528921570060525',
      sessionId: 'sess_' + (Date.now() + 1),
      deviceUDID: '1e4c71dd5439f717',
      homeId: '746973',
      prompt: 'Buzdolabı sıcaklığını ayarla',
      response: 'Buzdolabı sıcaklığı 4°C olarak ayarlandı',
      skuNumber: 'DEF456',
      timestamp: new Date()
  },
  {
    requestId: 'req_' + (Date.now() + 2),
      applianceId: 'T999927528921570060526',
      sessionId: 'sess_' + (Date.now() + 2),
      deviceUDID: '2f5d82ee6540a828',
      homeId: '746974',
      prompt: 'Çamaşır makinesi programını değiştir',
      response: 'Çamaşır makinesi programı pamuklu 40°C olarak ayarlandı',
      skuNumber: 'GHI789',
      timestamp: new Date()
  }
];

async function connectToMongoDB() {
  try {
    console.log('MongoDB\'ye baglaniliyor...');
    const client = new MongoClient(MONGODB_URI, {
      useUnifiedTopology: true,
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
    
    // Var olan loglari kontrol etmek icin id'leri cekiyoruz
    const existingLogs = await collection.find({ id: { $in: logs.map(l => l.id) } }).toArray();
    const existingLogIds = existingLogs.map(l => l.id);
    
    const newLogs = logs.filter(log => !existingLogIds.includes(log.id));
    
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
      .limit(3)
      .toArray();
    
    console.log('?? Son eklenen loglar:');
    recentLogs.forEach((log, i) => {
      console.log(`${i + 1}. [${log.status.toUpperCase()}] ${log.question} -> ${log.answer}`);
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
