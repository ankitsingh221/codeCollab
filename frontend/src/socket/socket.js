import { io } from 'socket.io-client';

let socket = null;

// Track the rooms this client should be in so we can transparently
// re-join them after any reconnect (network drop, server restart, etc.)
const activeRooms = { workspaceId: null, fileIds: new Set() };

export const getSocket = () => {
  if (socket) return socket;

  socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
    auth: { token: localStorage.getItem('accessToken') },
    autoConnect: false,
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 800,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: Infinity,
  });

  // On every (re)connection make sure auth is fresh and re-join all rooms
  socket.on('connect', () => {
    socket.auth.token = localStorage.getItem('accessToken');
    if (activeRooms.workspaceId) {
      socket.emit('workspace:join', { workspaceId: activeRooms.workspaceId });
    }
    activeRooms.fileIds.forEach((fileId) => {
      socket.emit('file:join', { fileId });
    });
  });

  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  s.auth.token = localStorage.getItem('accessToken'); // refresh in case it rotated
  if (!s.connected && !s.active) s.connect();
  return s;
};

export const disconnectSocket = () => {
  if (socket) {
    activeRooms.workspaceId = null;
    activeRooms.fileIds.clear();
    if (socket.connected) socket.disconnect();
  }
};

export const setActiveWorkspace = (workspaceId) => {
  activeRooms.workspaceId = workspaceId;
};

export const clearActiveWorkspace = () => {
  activeRooms.workspaceId = null;
};

export const addActiveFile = (fileId) => {
  if (fileId) activeRooms.fileIds.add(fileId);
};

export const removeActiveFile = (fileId) => {
  activeRooms.fileIds.delete(fileId);
};
