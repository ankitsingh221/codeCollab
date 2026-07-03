import { useEffect, useState } from 'react';
import { connectSocket } from '../socket/socket';

export const useWorkspacePresence = (workspaceId) => {
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!workspaceId) return;
    const socket = connectSocket();

    const handlePresence = ({ users }) => setOnlineUsers(users);

    socket.emit('workspace:join', { workspaceId });
    socket.on('workspace:presence', handlePresence);

    return () => {
      socket.emit('workspace:leave', { workspaceId });
      socket.off('workspace:presence', handlePresence);
    };
  }, [workspaceId]);

  return onlineUsers;
};