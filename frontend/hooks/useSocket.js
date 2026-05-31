import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './useAuth';

const TRACKING_URL = process.env.EXPO_PUBLIC_TRACKING_URL || 'http://localhost:3000';

export function useSocket(orderId) {
  const { token } = useAuth();
  const [connectionError, setConnectionError] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!token || !orderId) {
      return undefined;
    }

    const socket = io(TRACKING_URL, {
      auth: { token },
    });

    socket.on('connect', () => {
      setConnectionError('');
      setIsConnected(true);
      socket.emit('order:subscribe', { orderId }, (response) => {
        if (!response?.ok) {
          setConnectionError(response?.message || 'No se pudo suscribir al pedido.');
        }
      });
    });

    socket.on('connect_error', (error) => {
      setConnectionError(error.message || 'No se pudo conectar al tracking.');
      setIsConnected(false);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('location:update', (nextLocation) => {
      if (nextLocation.orderId === orderId) {
        setLocation(nextLocation);
      }
    });

    socket.on('order:status-update', (update) => {
      if (update.orderId === orderId) {
        setStatus(update.status);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId, token]);

  return { connectionError, isConnected, location, setLocation, setStatus, status };
}
