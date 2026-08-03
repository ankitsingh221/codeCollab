const OnlineUsers = ({ users }) => {
  // Design tokens matching Landing page
  const raisedSm = {
    background: "linear-gradient(160deg, #F7F8FA 0%, #E7E9EC 100%)",
    boxShadow:
      "4px 4px 10px rgba(163,167,178,0.4), -4px -4px 10px rgba(255,255,255,0.85)",
    border: "1px solid rgba(255,255,255,0.5)",
  };

  const pressed = {
    background: "linear-gradient(160deg, #E3E5E9 0%, #F0F1F4 100%)",
    boxShadow:
      "inset 3px 3px 7px rgba(163,167,178,0.5), inset -3px -3px 7px rgba(255,255,255,0.9)",
  };

  if (!users || users.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={raisedSm}>
      <div className="flex -space-x-2">
        {users.slice(0, 5).map((u, index) => (
          <div
            key={u.userId}
            title={u.name}
            className="relative w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white overflow-hidden transition-all duration-300 hover:scale-110 hover:z-10"
            style={{
              backgroundColor: u.color || '#C1652F',
              border: '2px solid rgba(255,255,255,0.6)',
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.05)',
              marginLeft: index > 0 ? '-6px' : '0'
            }}
          >
            {u.avatarUrl ? (
              <img 
                src={u.avatarUrl} 
                alt={u.name} 
                className="w-full h-full object-cover rounded-full"
                style={{
                  boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.2)'
                }}
              />
            ) : (
              <span style={{
                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}>
                {u.name?.charAt(0).toUpperCase()}
              </span>
            )}
            {/* Online status indicator */}
            <span 
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
              style={{
                background: 'radial-gradient(circle at 40% 40%, #6B9E6B, #4A7A4A)',
                borderColor: 'rgba(255,255,255,0.8)',
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3), 0 1px 3px rgba(0,0,0,0.05)'
              }}
            />
          </div>
        ))}
      </div>
      {users.length > 5 && (
        <span 
          className="text-xs font-medium px-2 py-0.5 rounded-lg"
          style={{
            ...pressed,
            color: '#787B85',
            fontSize: '10px',
            padding: '2px 6px'
          }}
        >
          +{users.length - 5}
        </span>
      )}
    </div>
  );
};

export default OnlineUsers;