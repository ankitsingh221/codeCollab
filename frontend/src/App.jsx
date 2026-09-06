import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastProvider } from "./context/ToastContext";
import ErrorBoundary from "./components/ErrorBoundary";

// Code-split every page so heavy deps (Monaco, Yjs) only load when needed
const Landing = lazy(() => import("./pages/Landing"));
const Signup = lazy(() => import("./pages/Signup"));
const Login = lazy(() => import("./pages/Login"));
const Profile = lazy(() => import("./pages/Profile"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const WorkSpace = lazy(() => import("./pages/WorkSpace"));
const MembersManagement = lazy(() => import("./pages/MembersManagement"));
const InviteUser = lazy(() => import("./pages/InviteUser"));
const WorkspaceSettings = lazy(() => import("./pages/WorkspaceSettings"));
const NotFound = lazy(() => import("./pages/NotFound"));

const PageLoader = () => (
  <div
    className="min-h-screen flex items-center justify-center"
    style={{ background: "#ECEDF0" }}
  >
    <div
      className="relative w-14 h-14 rounded-full flex items-center justify-center"
      style={{
        background: "linear-gradient(160deg, #F7F8FA 0%, #E7E9EC 100%)",
        boxShadow:
          "4px 4px 10px rgba(163,167,178,0.4), -4px -4px 10px rgba(255,255,255,0.85)",
      }}
    >
      <div className="w-8 h-8 border-4 border-[#C1652F] border-t-transparent rounded-full animate-spin" />
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <div className="h-screen overflow-y-auto overflow-x-hidden">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/login" element={<Login />} />

                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route
                      path="/workspace/:workspaceId/settings"
                      element={<WorkspaceSettings />}
                    />
                    <Route
                      path="/workspace/:workspaceId/members"
                      element={<MembersManagement />}
                    />
                    <Route
                      path="/workspace/:workspaceId/invite"
                      element={<InviteUser />}
                    />
                    <Route
                      path="/workspace/:workspaceId"
                      element={<WorkSpace />}
                    />
                  </Route>

                  {/* Catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </div>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
