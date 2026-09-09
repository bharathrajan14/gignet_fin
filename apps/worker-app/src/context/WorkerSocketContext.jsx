import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useWorkerAuth } from './WorkerAuthContext';

const WorkerSocketContext = createContext();

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return 'http://localhost:5000';
  return envUrl.trim().replace(/\/+$/, '').replace(/\/api\/v1\/?$/, '');
};
const SOCKET_URL = getSocketUrl();

export function WorkerSocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const { workerProfile } = useWorkerAuth();

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log(`[WorkerSocket] Connected: ${newSocket.id}`);
      if (workerProfile?._id) {
        newSocket.emit('join:worker', workerProfile._id);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket && workerProfile?._id) {
      const currentWorkerId = workerProfile._id;
      socket.emit('join:worker', currentWorkerId);
      console.log(`[WorkerSocket] Joined room: worker:${currentWorkerId}`);

      return () => {
        socket.emit('leave:worker', currentWorkerId);
        console.log(`[WorkerSocket] Left room: worker:${currentWorkerId}`);
      };
    }
  }, [socket, workerProfile?._id]);

  return (
    <WorkerSocketContext.Provider value={socket}>
      {children}
    </WorkerSocketContext.Provider>
  );
}

export const useWorkerSocket = () => useContext(WorkerSocketContext);
