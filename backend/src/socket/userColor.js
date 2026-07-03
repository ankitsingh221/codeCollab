const COLORS = [
  "#f43f5e", "#06b6d4", "#a855f7", "#f59e0b", "#22c55e",
  "#3b82f6", "#ec4899", "#14b8a6", "#eab308", "#8b5cf6",
];

export const getColorForUser = (userId) => {
  const str = userId.toString();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
};