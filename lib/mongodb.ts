import { MongoClient, Db } from 'mongodb';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Please add your MongoDB URI to the MONGODB_URI environment variable.');
  }
  return uri;
}

export async function connectToDatabase(): Promise<Db> {
  if (cachedClient && cachedDb) {
    return cachedDb;
  }

  const client = new MongoClient(getMongoUri());
  await client.connect();
  const db = client.db();

  cachedClient = client;
  cachedDb = db;

  return db;
}
