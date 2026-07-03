import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (socket) return socket;

  socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
    auth: { token: localStorage.getItem('accessToken') },
    autoConnect: false,
    transports: ['websocket'],
  });

  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  s.auth.token = localStorage.getItem('accessToken'); // refresh in case it rotated
  if (!s.connected) s.connect();
  return s;
};

export const disconnectSocket = () => {
  if (socket && socket.connected) socket.disconnect();
};