import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="relative">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-pulse"></div>
          
          {/* Spinning ring with gradient */}
          <div className="w-12 h-12 rounded-full border-4 border-t-cyan-400 border-r-red-500 border-b-cyan-400 border-l-transparent animate-spin"></div>
          
          {/* Inner dot */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full"></div>
          
          <p className="mt-6 text-sm text-gray-500 tracking-wider uppercase font-mono">
            Authenticating
            <span className="inline-block ml-1 animate-pulse">.</span>
            <span className="inline-block ml-1 animate-pulse delay-100">.</span>
            <span className="inline-block ml-1 animate-pulse delay-200">.</span>
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate 
        to="/login" 
        replace 
        state={{ from: window.location.pathname }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Subtle gradient accent line at top */}
      <div className="h-[2px] bg-gradient-to-r from-cyan-500 via-red-500 to-cyan-500 opacity-50"></div>
      
      {/* Main content with slight padding */}
      <div className="relative">
        <Outlet />
      </div>
    </div>
  );
};

export default ProtectedRoute;