import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/easyshop';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Global is used here to maintain a cached connection across hot reloads
// in development. This prevents connections growing exponentially
// during API Route usage.
let cached = (global as any).mongoose || { conn: null, promise: null };

// Add connection event handlers
const setConnectionHandlers = () => {
  const db = mongoose.connection;
  
  db.on('connected', () => {
    console.log('MongoDB connected successfully');
  });
  
  db.on('error', (error) => {
    console.error('MongoDB connection error:', error);
  });
  
  db.on('disconnected', () => {
    console.log('MongoDB disconnected');  
  });
};

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      setConnectionHandlers();
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Export the mongoose instance for direct use if needed
export { mongoose };

export default dbConnect;
