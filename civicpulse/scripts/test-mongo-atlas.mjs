import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb+srv://sanjayrajendran25_db_user:tV6V3upNmHqYyndx@cluster0.tnapac1.mongodb.net/?retryWrites=true&w=majority';

console.log('🔍 Testing MongoDB Atlas connectivity...');
console.log('URI:', uri.replace(/:([^@]+)@/, ':****@'));

async function testShards() {
  const shards = [
    'ac-vb8lmw5-shard-00-00.tnapac1.mongodb.net:27017',
    'ac-vb8lmw5-shard-00-01.tnapac1.mongodb.net:27017',
    'ac-vb8lmw5-shard-00-02.tnapac1.mongodb.net:27017',
  ];

  for (const host of shards) {
    const directUri = `mongodb://sanjayrajendran25_db_user:tV6V3upNmHqYyndx@${host}/civicpulse_db?ssl=true&authSource=admin&directConnection=true`;
    try {
      const client = new MongoClient(directUri, { serverSelectionTimeoutMS: 3000 });
      await client.connect();
      const isMaster = await client.db().admin().command({ isMaster: 1 });
      console.log(`✅ ${host} -> CONNECTED! (isPrimary: ${isMaster.ismaster})`);
      await client.close();
    } catch (err) {
      console.log(`❌ ${host} -> REJECTED (${err.message.includes('alert number 80') ? 'Firewall dropped / IP not whitelisted' : err.message})`);
    }
  }

  console.log('\nTesting full ReplicaSet connection...');
  try {
    const fullClient = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    await fullClient.connect();
    console.log('🎉🎉 SUCCESS: Connected to MongoDB Atlas Cluster0 ReplicaSet!');
    const db = fullClient.db('civicpulse_db');
    
    // Create collections if not exist
    await db.collection('users').createIndex({ email: 1 });
    await db.collection('chat_logs').createIndex({ timestamp: -1 });
    await db.collection('feedback').createIndex({ timestamp: -1 });

    const collections = await db.listCollections().toArray();
    console.log('📁 Collections in civicpulse_db:', collections.map(c => c.name));
    await fullClient.close();
  } catch (err) {
    console.log('❌ ReplicaSet connection:', err.message);
  }
}

testShards().catch(console.error);
