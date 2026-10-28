import { MongoClient, ObjectId, Db } from 'mongodb';
import fs from 'fs';
import path from 'path';

const MONGODB_URI = process.env.MONGODB_URI || '';
const DB_NAME = process.env.MONGODB_DB || 'civicpulse_db';

export const isMongoConfigured = (): boolean => {
  return Boolean(MONGODB_URI && (MONGODB_URI.startsWith('mongodb://') || MONGODB_URI.startsWith('mongodb+srv://')));
};

// ============================================================================
// DYNAMIC MONGODB CONNECTION WITH RECONNECTION & FALLBACK
// ============================================================================

let cachedDb: Db | null = null;
let lastAttempt = 0;
let connectionFailed = false;
let isSynced = false;

export async function getMongoDb(): Promise<Db | null> {
  if (!isMongoConfigured()) return null;
  if (cachedDb) return cachedDb;

  // Throttle connection retries to once every 10 seconds if failing
  const now = Date.now();
  if (connectionFailed && now - lastAttempt < 10000) {
    return null;
  }

  lastAttempt = now;
  try {
    const mClient = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 4000,
    });
    await mClient.connect();
    cachedDb = mClient.db(DB_NAME);
    connectionFailed = false;
    console.log(`[MongoDB Atlas] Successfully connected to live database: ${DB_NAME}`);

    // Auto-sync existing local logs and users to Atlas
    if (!isSynced) {
      isSynced = true;
      syncLocalStoreToAtlas(cachedDb).catch((err) =>
        console.warn('[MongoDB Atlas] Auto-sync warning:', err.message)
      );
    }

    return cachedDb;
  } catch (err: any) {
    connectionFailed = true;
    console.warn(`[MongoDB Atlas] Live connection not yet established (${err.message}). Using synchronized local persistence.`);
    return null;
  }
}

// ============================================================================
// EMBEDDED FALLBACK STORE (Used when MONGODB_URI is unconfigured or offline)
// ============================================================================

const LOCAL_STORE_PATH = path.join(process.cwd(), 'data', 'mongodb_store.json');

export interface MongoStoreData {
  users: Array<{
    _id: string;
    name: string;
    email: string;
    role: string;
    neighborhood?: string;
    phone?: string;
    createdAt: string;
    updatedAt: string;
  }>;
  chat_logs: Array<{
    _id: string;
    sessionId: string;
    userEmail?: string;
    messages: Array<{ role: string; content: string; timestamp: string }>;
    createdTicketId?: string;
    timestamp: string;
  }>;
  feedback: Array<{
    _id: string;
    userEmail?: string;
    rating: number;
    category?: string;
    comment: string;
    pageUrl?: string;
    timestamp: string;
  }>;
}

const INITIAL_STORE: MongoStoreData = {
  users: [
    {
      _id: 'usr_m_101',
      name: 'Elena Rostova',
      email: 'elena.rostova@civicpulse.org',
      role: 'citizen',
      neighborhood: 'Downtown District 7',
      phone: '(206) 555-0182',
      createdAt: '2026-09-15T10:00:00Z',
      updatedAt: '2026-09-15T10:00:00Z',
    },
    {
      _id: 'usr_m_102',
      name: 'Marcus Vance',
      email: 'marcus.vance@city.civicpulse.gov',
      role: 'staff',
      neighborhood: 'Public Works Division',
      phone: '(206) 555-0914',
      createdAt: '2025-04-10T08:30:00Z',
      updatedAt: '2025-04-10T08:30:00Z',
    },
  ],
  chat_logs: [
    {
      _id: 'log_m_001',
      sessionId: 'sess-init-01',
      userEmail: 'elena.rostova@civicpulse.org',
      messages: [
        { role: 'user', content: 'What does error code 403 mean on CivicPulse?', timestamp: '2026-10-26T10:15:00Z' },
        { role: 'assistant', content: 'Error 403 represents "Forbidden". In CivicPulse, this happens when a citizen user attempts to access staff-restricted triage desks or alter official audit logs. Only authorized municipal staff can perform triage dispatches.', timestamp: '2026-10-26T10:15:05Z' }
      ],
      timestamp: '2026-10-26T10:15:05Z',
    }
  ],
  feedback: [
    {
      _id: 'fb_m_001',
      userEmail: 'elena.rostova@civicpulse.org',
      rating: 5,
      category: 'ai_assistant',
      comment: 'Assistant gave instant explanation of the municipal SLA turnaround!',
      pageUrl: '/dashboard',
      timestamp: '2026-10-26T10:16:00Z',
    }
  ],
};

export function readLocalStore(): MongoStoreData {
  try {
    if (!fs.existsSync(LOCAL_STORE_PATH)) {
      const dir = path.dirname(LOCAL_STORE_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(LOCAL_STORE_PATH, JSON.stringify(INITIAL_STORE, null, 2));
      return INITIAL_STORE;
    }
    const raw = fs.readFileSync(LOCAL_STORE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return INITIAL_STORE;
  }
}

export function writeLocalStore(data: MongoStoreData) {
  try {
    const dir = path.dirname(LOCAL_STORE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LOCAL_STORE_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing local mongo store:', err);
  }
}

/**
 * Automatically syncs local store records into MongoDB Atlas when online
 */
export async function syncLocalStoreToAtlas(db: Db) {
  try {
    const store = readLocalStore();

    // 1. Sync users
    for (const u of store.users) {
      await db.collection('users').updateOne(
        { email: u.email },
        { $setOnInsert: u },
        { upsert: true }
      );
    }

    // 2. Sync chat logs
    for (const log of store.chat_logs) {
      await db.collection('chat_logs').updateOne(
        { sessionId: log.sessionId, timestamp: log.timestamp },
        { $setOnInsert: log },
        { upsert: true }
      );
    }

    // 3. Sync feedback
    for (const fb of store.feedback) {
      await db.collection('feedback').updateOne(
        { userEmail: fb.userEmail, timestamp: fb.timestamp },
        { $setOnInsert: fb },
        { upsert: true }
      );
    }

    console.log('[MongoDB Atlas] Local stores successfully synced to Atlas collections.');
  } catch (err: any) {
    console.warn('[MongoDB Atlas] Sync error:', err.message);
  }
}

// ============================================================================
// CRUD USER OPERATIONS
// ============================================================================

export async function mongoCreateUser(userData: {
  name: string;
  email: string;
  role?: string;
  neighborhood?: string;
  phone?: string;
}) {
  const now = new Date().toISOString();
  const db = await getMongoDb();
  if (db) {
    try {
      const res = await db.collection('users').insertOne({
        ...userData,
        role: userData.role || 'citizen',
        createdAt: now,
        updatedAt: now,
      });
      return { _id: res.insertedId.toString(), ...userData, createdAt: now, updatedAt: now };
    } catch (e) {
      console.warn('MongoDB error, using local store:', e);
    }
  }

  const store = readLocalStore();
  const newUser = {
    _id: `usr_m_${Date.now()}`,
    ...userData,
    role: userData.role || 'citizen',
    createdAt: now,
    updatedAt: now,
  };
  store.users.unshift(newUser);
  writeLocalStore(store);
  return newUser;
}

export async function mongoGetUsers() {
  const db = await getMongoDb();
  if (db) {
    try {
      const users = await db.collection('users').find({}).sort({ createdAt: -1 }).toArray();
      if (users.length > 0) {
        return users.map((u) => ({ ...u, _id: u._id.toString() }));
      }
    } catch (e) {
      console.warn('MongoDB error, using local store:', e);
    }
  }
  const store = readLocalStore();
  return store.users;
}

export async function mongoGetUserById(id: string) {
  const db = await getMongoDb();
  if (db) {
    try {
      const user = await db.collection('users').findOne({
        $or: [{ _id: id as any }, { _id: new ObjectId(id) as any }],
      });
      if (user) return { ...user, _id: user._id.toString() };
    } catch (e) {
      console.warn('MongoDB error, using local store:', e);
    }
  }
  const store = readLocalStore();
  return store.users.find((u) => u._id === id) || null;
}

export async function mongoUpdateUser(
  id: string,
  updates: Partial<{ name: string; email: string; role: string; neighborhood: string; phone: string }>
) {
  const now = new Date().toISOString();
  const db = await getMongoDb();
  if (db) {
    try {
      await db.collection('users').updateOne(
        { $or: [{ _id: id as any }, { _id: new ObjectId(id) as any }] },
        { $set: { ...updates, updatedAt: now } }
      );
      return mongoGetUserById(id);
    } catch (e) {
      console.warn('MongoDB error, using local store:', e);
    }
  }

  const store = readLocalStore();
  const index = store.users.findIndex((u) => u._id === id);
  if (index === -1) return null;
  store.users[index] = { ...store.users[index], ...updates, updatedAt: now };
  writeLocalStore(store);
  return store.users[index];
}

export async function mongoDeleteUser(id: string) {
  const db = await getMongoDb();
  if (db) {
    try {
      const res = await db.collection('users').deleteOne({
        $or: [{ _id: id as any }, { _id: new ObjectId(id) as any }],
      });
      return res.deletedCount > 0;
    } catch (e) {
      console.warn('MongoDB error, using local store:', e);
    }
  }

  const store = readLocalStore();
  const initLen = store.users.length;
  store.users = store.users.filter((u) => u._id !== id);
  writeLocalStore(store);
  return store.users.length < initLen;
}

// ============================================================================
// CHAT LOGS STORAGE
// ============================================================================

export async function mongoSaveChatLog(log: {
  sessionId: string;
  userEmail?: string;
  messages: Array<{ role: string; content: string; timestamp?: string }>;
  createdTicketId?: string;
}) {
  const now = new Date().toISOString();
  const formattedMessages = log.messages.map((m) => ({
    role: m.role,
    content: m.content,
    timestamp: m.timestamp || now,
  }));

  const db = await getMongoDb();
  if (db) {
    try {
      const res = await db.collection('chat_logs').insertOne({
        sessionId: log.sessionId,
        userEmail: log.userEmail,
        messages: formattedMessages,
        createdTicketId: log.createdTicketId,
        timestamp: now,
      });
      return { _id: res.insertedId.toString(), ...log, timestamp: now };
    } catch (e) {
      console.warn('MongoDB error, using local store:', e);
    }
  }

  const store = readLocalStore();
  const newLog = {
    _id: `log_m_${Date.now()}`,
    sessionId: log.sessionId,
    userEmail: log.userEmail,
    messages: formattedMessages,
    createdTicketId: log.createdTicketId,
    timestamp: now,
  };
  store.chat_logs.unshift(newLog);
  writeLocalStore(store);
  return newLog;
}

export async function mongoGetChatLogs() {
  const db = await getMongoDb();
  if (db) {
    try {
      const logs = await db.collection('chat_logs').find({}).sort({ timestamp: -1 }).limit(50).toArray();
      if (logs.length > 0) {
        return logs.map((l) => ({ ...l, _id: l._id.toString() }));
      }
    } catch (e) {
      console.warn('MongoDB error, using local store:', e);
    }
  }
  const store = readLocalStore();
  return store.chat_logs;
}

// ============================================================================
// FEEDBACK STORAGE
// ============================================================================

export async function mongoSaveFeedback(feedback: {
  userEmail?: string;
  rating: number;
  category?: string;
  comment: string;
  pageUrl?: string;
}) {
  const now = new Date().toISOString();
  const db = await getMongoDb();
  if (db) {
    try {
      const res = await db.collection('feedback').insertOne({
        ...feedback,
        timestamp: now,
      });
      return { _id: res.insertedId.toString(), ...feedback, timestamp: now };
    } catch (e) {
      console.warn('MongoDB error, using local store:', e);
    }
  }

  const store = readLocalStore();
  const newFeedback = {
    _id: `fb_m_${Date.now()}`,
    ...feedback,
    timestamp: now,
  };
  store.feedback.unshift(newFeedback);
  writeLocalStore(store);
  return newFeedback;
}

export async function mongoGetFeedback() {
  const db = await getMongoDb();
  if (db) {
    try {
      const items = await db.collection('feedback').find({}).sort({ timestamp: -1 }).limit(50).toArray();
      if (items.length > 0) {
        return items.map((f) => ({ ...f, _id: f._id.toString() }));
      }
    } catch (e) {
      console.warn('MongoDB error, using local store:', e);
    }
  }
  const store = readLocalStore();
  return store.feedback;
}
