import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useWorkerAuth } from './WorkerAuthContext';

const WorkerSocketContext = createContext();

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

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
      socket.emit('join:worker', workerProfile._id);
    }
  }, [socket, workerProfile]);

  return (
    <WorkerSocketContext.Provider value={socket}>
      {children}
    </WorkerSocketContext.Provider>
  );
}

export const useWorkerSocket = () => useContext(WorkerSocketContext);
