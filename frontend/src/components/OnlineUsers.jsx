const OnlineUsers = ({ users }) => {
  if (!users || users.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {users.slice(0, 5).map((u) => (
          <div
            key={u.userId}
            title={u.name}
            className="relative w-7 h-7 rounded-full border-2 border-[#0a0a0a] flex items-center justify-center text-xs font-medium text-black overflow-hidden"
            style={{ backgroundColor: u.color }}
          >
            {u.avatarUrl ? (
              <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" />
            ) : (
              u.name?.charAt(0).toUpperCase()
            )}
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0a0a0a]" />
          </div>
        ))}
      </div>
      {users.length > 5 && <span className="text-xs text-white/30">+{users.length - 5}</span>}
    </div>
  );
};

export default OnlineUsers;