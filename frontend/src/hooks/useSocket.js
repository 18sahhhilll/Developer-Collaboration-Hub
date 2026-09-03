import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const useSocket = (onNotification) => {
  const callbackRef = useRef(onNotification);
  callbackRef.current = onNotification;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (!socket) {
      socket = io(SOCKET_URL, { auth: { token } });
    }

    const handler = (notification) => {
      callbackRef.current?.(notification);
    };

    socket.on('new_notification', handler);

    return () => {
      socket?.off('new_notification', handler);
    };
  }, []);
};

export const getSocket = () => socket;

export default useSocket;
