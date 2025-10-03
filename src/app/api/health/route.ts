import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

// Cache the connection status
let isConnected = false;

// Function to check MongoDB connection
async function checkMongoDBConnection() {
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return true;
  }

  try {
    // Try to connect if not already connected
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/easyshop', {
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
    });
    isConnected = true;
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    isConnected = false;
    return false;
  }
}

export async function GET() {
  try {
    const [dbStatus] = await Promise.all([
      checkMongoDBConnection(),
      // Add other health checks here if needed
    ]);

    const status = dbStatus ? 'healthy' : 'degraded';
    const statusCode = dbStatus ? 200 : 503;

    return NextResponse.json(
      { 
        status,
        database: dbStatus ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        nodeEnv: process.env.NODE_ENV || 'development',
      },
      { status: statusCode }
    );
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
