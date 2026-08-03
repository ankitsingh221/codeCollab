import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Code2,
  Users,
  Zap,
  ArrowRight,
  Sparkles,
  Globe,
  User,
  CheckCircle2,
  LogOut,
  Lock,
  Repeat,
  Terminal,
  Shield,
} from "lucide-react";
import { useEffect } from "react";
import CollabEditorPreview from "../components/CollabEditorPreview";

/* ---------------------------------------------------
   DESIGN TOKENS — "Analog Panel" theme
   Base:      #ECEDF0
   Panel:     linear-gradient(#F6F7F9, #E4E6EA)
   Ink:       #2B2B2F
   Muted:     #787B85
   Accent:    #C1652F  (copper — echoes the EQ trace)
   Success:   #6B9E6B
   Shadows:   raised  -> light top-left / dark bottom-right
              pressed -> inset dark top-left / light bottom-right
--------------------------------------------------- */

const raised = {
  background: "linear-gradient(160deg, #F7F8FA 0%, #E5E7EB 100%)",
  boxShadow:
    "7px 7px 16px rgba(163,167,178,0.45), -7px -7px 16px rgba(255,255,255,0.85), inset 0 1px 0 rgba(255,255,255,0.6)",
  border: "1px solid rgba(255,255,255,0.5)",
};

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

const features = [
  {
    icon: Users,
    title: "Live Collaboration",
    desc: "Multiple developers can edit code simultaneously with real-time cursor tracking.",
  },
  {
    icon: Zap,
    title: "Instant Sync",
    desc: "Every keystroke syncs across all connected members instantly using Socket.IO.",
  },
  {
    icon: Globe,
    title: "Multi-language",
    desc: "HTML, CSS, JS, Python, C++, and more with Monaco Editor.",
  },
  {
    icon: Lock,
    title: "Secure Auth",
    desc: "JWT-based authentication with protected routes and session management.",
  },
  {
    icon: Repeat,
    title: "Room-based Collab",
    desc: "Create or join rooms with unique IDs for organized team workspaces.",
  },
  {
    icon: Terminal,
    title: "Code Execution",
    desc: "Run code directly in the browser with real-time output display.",
  },
];

const stats = [
  { value: "Socket.IO", label: "Real-time Sync", icon: Zap },
  { value: "Monaco", label: "Code Editor", icon: Code2 },
  { value: "JWT", label: "Authentication", icon: Shield },
];

/* Small reusable "power dot" like the panel headers in the reference */
const PowerDot = () => (
  <div
    className="mx-auto w-9 h-9 rounded-full flex items-center justify-center mb-4"
    style={pressed}
  >
    <div
      className="w-2 h-2 rounded-full"
      style={{ background: "#C1652F", boxShadow: "0 0 6px rgba(193,101,47,0.6)" }}
    />
  </div>
);

const Landing = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ECEDF0] flex items-center justify-center">
        <div className="relative w-14 h-14 rounded-full flex items-center justify-center" style={raisedSm}>
          <div className="w-8 h-8 border-4 border-[#C1652F] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen overflow-y-auto text-[#2B2B2F] overflow-x-hidden relative"
      style={{ background: "#ECEDF0" }}
    >
      {/* Faint paper-grain texture, keeps the flat gray from looking dead */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.4]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(0,0,0,0.015) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
        }}
      />

      {/* Nav */}
      <nav
        className="relative mx-auto mt-4 sm:mt-6 px-6 py-4 max-w-7xl rounded-[20px] transition-all duration-300"
        style={raised}
      >
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div
              className="relative p-2.5 rounded-xl transition-all duration-300 group-hover:scale-105"
              style={pressed}
            >
              <Code2 className="text-[#C1652F]" size={22} />
            </div>
            <span className="text-2xl font-bold tracking-tight" style={{ color: "#2B2B2F" }}>
              Code<span style={{ color: "#C1652F" }}>Collab</span>
            </span>
          </Link>

          <div className="flex gap-2">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  asChild
                  className="px-4 py-2 font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{ ...raisedSm, borderRadius: "10px", color: "#4A4C53" }}
                >
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="px-4 py-2 font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{ ...raisedSm, borderRadius: "10px", color: "#C1502F" }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  asChild
                  className="px-4 py-2 font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{ ...raisedSm, borderRadius: "10px", color: "#4A4C53" }}
                >
                  <Link to="/login">Log In</Link>
                </Button>
                <Button
                  asChild
                  className="px-6 py-2 font-bold transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{
                    background: "linear-gradient(160deg, #D07B47, #B0552A)",
                    boxShadow:
                      "4px 4px 10px rgba(163,167,178,0.5), -2px -2px 6px rgba(255,255,255,0.4), inset 0 1px 0 rgba(255,255,255,0.25)",
                    borderRadius: "10px",
                    color: "#FBF6F1",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="relative max-w-7xl mx-auto px-6 pt-12 pb-20">
        {/* Hero */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <div
              className="inline-flex items-center gap-2 px-5 py-2 mb-8 rounded-full transition-all duration-300"
              style={pressed}
            >
              <Sparkles className="w-3 h-3" style={{ color: "#C1652F" }} />
              <span
                className="text-[11px] tracking-[0.15em] uppercase font-bold"
                style={{ color: "#6B6D75" }}
              >
                Collaborative Coding Platform
              </span>
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: "#C1652F" }}
              />
            </div>

            <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]" style={{ color: "#26262B" }}>
              Code together, <br />
              <span style={{ color: "#C1652F" }}>in real time.</span>
            </h1>

            <p className="mt-6 text-base max-w-lg leading-relaxed" style={{ color: "#6B6D75" }}>
              Create workspaces, invite your team, and write HTML, CSS,
              JavaScript, Python, C++ and more —
              <span style={{ color: "#B0552A", fontWeight: 700 }}> together</span>,
              with live cursors and instant sync powered by Socket.IO.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                asChild
                className="group px-10 py-3 font-bold transition-all duration-300 hover:scale-105 active:scale-95"
                style={{
                  background: "linear-gradient(160deg, #D07B47, #B0552A)",
                  boxShadow:
                    "6px 6px 14px rgba(163,167,178,0.5), -3px -3px 10px rgba(255,255,255,0.4), inset 0 1px 0 rgba(255,255,255,0.25)",
                  borderRadius: "14px",
                  color: "#FBF6F1",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <Link to={user ? "/dashboard" : "/signup"} className="flex items-center gap-2">
                  {user ? "Go to Dashboard" : "Get Started Free"}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
              </Button>
            </div>

            <div className="flex items-center gap-6 mt-8">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                    style={{ ...raisedSm, border: "2px solid #ECEDF0" }}
                  >
                    <User size={14} style={{ color: "#8A8C94" }} />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" style={{ color: "#6B9E6B" }} />
                <span className="text-sm" style={{ color: "#787B85" }}>
                  Built for developers and students
                </span>
              </div>
            </div>
          </div>

          {/* Code Preview, framed like a hardware module */}
          <div className="p-4 rounded-[20px]" style={raised}>
            <div className="flex items-center justify-between px-2 pb-3 mb-3" style={{ borderBottom: "1px solid rgba(163,167,178,0.25)" }}>
              <span className="text-[11px] tracking-[0.15em] uppercase font-bold" style={{ color: "#8A8C94" }}>
                Live Preview
              </span>
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={pressed}>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#6B9E6B" }} />
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden" style={pressed}>
              <CollabEditorPreview />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 pt-10" style={{ borderTop: "1px solid rgba(163,167,178,0.25)" }}>
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="p-5 text-center transition-all duration-300 hover:scale-[1.03] active:scale-95 cursor-pointer rounded-[16px]"
                style={raisedSm}
              >
                <stat.icon className="w-5 h-5 mx-auto mb-2" style={{ color: "#C1652F" }} />
                <div className="text-lg font-bold" style={{ color: "#2B2B2F" }}>
                  {stat.value}
                </div>
                <div
                  className="text-[11px] mt-1 tracking-[0.1em] uppercase font-semibold"
                  style={{ color: "#8A8C94" }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features — styled as hardware "modules" */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold tracking-tight" style={{ color: "#26262B" }}>
              Built for <span style={{ color: "#C1652F" }}>teams</span>
            </h2>
            <div
              className="w-16 h-1 mx-auto mt-4 rounded-full transition-all duration-300 hover:w-24"
              style={{ background: "linear-gradient(90deg, #D07B47, #B0552A)" }}
            />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 text-center transition-all duration-500 ease-out cursor-pointer transform-gpu hover:-translate-y-1 hover:scale-[1.02] rounded-[18px]"
                style={raised}
              >
                <PowerDot />
                <feature.icon
                  className="w-8 h-8 mx-auto mb-4 transition-all duration-500 ease-out group-hover:scale-[1.1]"
                  style={{ color: "#C1652F" }}
                />
                <h3 className="text-lg font-bold tracking-tight mb-2" style={{ color: "#2B2B2F" }}>
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#787B85" }}>
                  {feature.desc}
                </p>
                <div className="mt-4 h-0.5 rounded-full bg-[linear-gradient(90deg,#D07B47,#B0552A)] scale-x-0 opacity-0 transition-all duration-500 ease-out group-hover:scale-x-100 group-hover:opacity-100 mx-auto w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="relative max-w-7xl mx-auto px-6 py-8 mb-6 rounded-[20px]"
        style={raisedSm}
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5" style={{ color: "#C1652F" }} />
            <span className="text-sm" style={{ color: "#787B85" }}>
              Built with ❤️
              <a
                href="https://www.linkedin.com/in/ankit-kumar-896051320/"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 font-semibold transition-all duration-300 hover:text-[#C1652F]"
                style={{ color: "#B0552A" }}
              >
                Ankit singh
              </a>
            </span>
          </div>
          <div className="text-xs tracking-wide" style={{ color: "#8A8C94" }}>
            © 2026 CodeCollab
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;