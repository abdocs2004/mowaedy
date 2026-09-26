import mongoose from 'mongoose';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import './models/index.js';

async function start() {
  try {
    await connectDB();
    console.log(`✅ MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
    // Build indexes (incl. the unique double-booking guard) before accepting traffic.
    await Promise.all(Object.values(mongoose.models).map((m) => m.init()));
  } catch (err) {
    console.error('❌ Could not connect to MongoDB:', err.message);
    console.error('   Check MONGODB_URI in backend/.env and that MongoDB is running.');
    process.exit(1);
  }

  const server = createApp().listen(env.port, () => console.log(`🚀 API running on http://localhost:${env.port}/api (${env.nodeEnv})`));

  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down…`);
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('unhandledRejection', (err) => console.error('Unhandled rejection:', err));
}

start();
