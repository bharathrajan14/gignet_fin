import { Server } from 'socket.io';
import WorkerLocation from '../models/WorkerLocation.js';
import { toH3 } from '../utils/geoUtils.js';

let ioInstance = null;

export function initSocketIO(httpServer) {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT']
    },
    pingTimeout: 30000,
    pingInterval: 10000
  });

  ioInstance.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join user-specific room
    socket.on('join:user', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`[Socket.IO] Socket ${socket.id} joined user:${userId}`);
      }
    });

    // Join worker-specific room
    socket.on('join:worker', (workerId) => {
      if (workerId) {
        socket.join(`worker:${workerId}`);
        console.log(`[Socket.IO] Socket ${socket.id} joined worker:${workerId}`);
      }
    });

    // Join cooperative-specific room
    socket.on('join:coop', (coopId) => {
      if (coopId) {
        socket.join(`coop:${coopId}`);
        console.log(`[Socket.IO] Socket ${socket.id} joined coop:${coopId}`);
      }
    });

    // Join admin room
    socket.on('join:admin', () => {
      socket.join('admin');
      console.log(`[Socket.IO] Socket ${socket.id} joined admin room`);
    });

    // Join booking tracking room
    socket.on('join:booking', (bookingId) => {
      if (bookingId) {
        socket.join(`booking:${bookingId}`);
        console.log(`[Socket.IO] Socket ${socket.id} joined booking:${bookingId}`);
      }
    });

    // Real-time worker GPS ping from device navigator.geolocation
    socket.on('worker:update_location', async (data) => {
      const { workerId, longitude, latitude, heading = 0, speed = 0, bookingId } = data;
      if (!workerId || longitude === undefined || latitude === undefined) return;

      try {
        const h3Res7 = toH3(latitude, longitude, 7);
        const h3Res8 = toH3(latitude, longitude, 8);

        await WorkerLocation.findOneAndUpdate(
          { workerId },
          {
            location: { type: 'Point', coordinates: [longitude, latitude] },
            h3Res7,
            h3Res8,
            heading,
            speed,
            updatedAt: new Date()
          },
          { upsert: true, new: true }
        );

        const payload = {
          workerId,
          coordinates: [longitude, latitude],
          heading,
          speed,
          updatedAt: new Date()
        };

        // Broadcast to customer tracking this booking
        if (bookingId) {
          ioInstance.to(`booking:${bookingId}`).emit('worker:location_tick', payload);
        }
        // Broadcast to admin live operations map
        ioInstance.to('admin').emit('worker:location_tick', payload);
      } catch (err) {
        console.error(`[Socket.IO] Error handling worker location ping:`, err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
}

export function getSocketIO() {
  return ioInstance;
}
