// workspaceId -> Map<userId, { socketId, name, avatarUrl, color }>
const workspacePresence = new Map();

export const addPresence = (workspaceId, userId, data) => {
  if (!workspacePresence.has(workspaceId)) workspacePresence.set(workspaceId, new Map());
  workspacePresence.get(workspaceId).set(userId, data);
};

export const removePresence = (workspaceId, userId) => {
  const map = workspacePresence.get(workspaceId);
  if (!map) return;
  map.delete(userId);
  if (map.size === 0) workspacePresence.delete(workspaceId);
};

export const getPresenceList = (workspaceId) => {
  const map = workspacePresence.get(workspaceId);
  if (!map) return [];
  return Array.from(map.entries()).map(([userId, data]) => ({ userId, ...data }));
};