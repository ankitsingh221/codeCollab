import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import MembersManagement from "./pages/MembersManagement";
import InviteUser from "./pages/InviteUser";
import Workspace from "./pages/WorkSpace";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="h-screen overflow-y-auto overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/workspace/:workspaceId" element={<Workspace />} />
              <Route path="/workspace/:workspaceId/members" element={<MembersManagement />} />
              <Route path="/workspace/:workspaceId/invite" element={<InviteUser />} />
            </Route>
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;