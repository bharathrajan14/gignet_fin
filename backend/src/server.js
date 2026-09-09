import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { initSocketIO } from './services/socketService.js';
import authRoutes from './routes/authRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import workerRoutes from './routes/workerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { seedDatabaseIfEmpty } from './seed/seedData.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'GIGNET Core Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/customer', customerRoutes);
app.use('/api/v1/worker', workerRoutes);
app.use('/api/v1/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[ServerError]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Socket.IO
initSocketIO(server);

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();
  await seedDatabaseIfEmpty();

  server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 GIGNET Core Backend Running on port ${PORT}`);
    console.log(`📍 REST API Prefix: /api/v1`);
    console.log(`⚡ WebSocket / Socket.IO ready on port ${PORT}`);
    console.log(`====================================================`);
  });
}

startServer();
