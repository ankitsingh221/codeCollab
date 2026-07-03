import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Code2,
  Users,
  Zap,
  ArrowRight,
  Sparkles,
  Globe,
  Play,
  User,
  CheckCircle2,
  Cpu,
  Shield,
  MessageSquare,
  GitBranch,
  LogOut,
} from "lucide-react";
import { useEffect } from "react";

const features = [
  {
    icon: Users,
    title: "Live Collaboration",
    desc: "See who's online and where their cursor is, in real time.",
    gradient: "from-rose-400 to-rose-300",
    bgGradient: "from-rose-500/20 to-rose-400/10",
  },
  {
    icon: Zap,
    title: "Instant Sync",
    desc: "Every keystroke syncs across every connected member instantly.",
    gradient: "from-cyan-400 to-cyan-300",
    bgGradient: "from-cyan-500/20 to-cyan-400/10",
  },
  {
    icon: Globe,
    title: "Multi-language",
    desc: "HTML, CSS, JS, Python, C++, and more with Monaco Editor.",
    gradient: "from-rose-400 to-cyan-400",
    bgGradient: "from-rose-500/20 to-cyan-500/10",
  },
];

const Landing = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  // If user is logged in, redirect to dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    await logout();
    // Stay on landing page after logout
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-rose-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-auto bg-gradient-to-br from-[#0a0a0a] via-[#0d0d0d] to-[#0a0a0a] text-white overflow-x-hidden relative">
      {/* Glass overlay lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M60 0 L0 0 0 60' fill='none' stroke='rgba(255,255,255,0.05)' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Glassmorphism nav */}
      <nav className="relative mx-auto mt-4 sm:mt-6 px-6 py-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl max-w-7xl">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-cyan-400 rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
              <div className="relative bg-black/50 p-2 rounded-lg border border-white/10">
                <Code2 className="text-white" size={24} />
              </div>
            </div>
            <span className="text-xl font-light tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              Code
              <span className="font-bold bg-gradient-to-r from-rose-400 to-cyan-400 bg-clip-text text-transparent">
                Collab
              </span>
            </span>
          </Link>

          <div className="flex gap-2">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  asChild
                  className="text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-xl"
                >
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="text-white/40 hover:text-rose-400 hover:bg-white/5 transition-all duration-300 rounded-xl"
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
                  className="text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-xl"
                >
                  <Link to="/login">Log In</Link>
                </Button>
                <Button
                  asChild
                  className="bg-gradient-to-r from-rose-500 to-rose-400 hover:from-rose-400 hover:to-rose-300 text-white font-semibold rounded-xl px-6 hover:shadow-xl hover:shadow-rose-500/25 transition-all duration-300 border border-white/20"
                >
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="relative max-w-7xl mx-auto px-6 pt-12 pb-20">
        {/* Hero Section with Code Preview */}
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left - Text Content */}
          <div className="text-left">
            <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-xs text-white/60 tracking-wider uppercase mb-8 hover:border-rose-400/30 transition-all duration-300">
              <Sparkles className="w-3 h-3 text-rose-400" />
              <span className="bg-gradient-to-r from-rose-400 to-cyan-400 bg-clip-text text-transparent font-semibold">
                Now in beta
              </span>
              <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse"></span>
            </div>

            <h1 className="text-5xl md:text-6xl font-light tracking-tight leading-[1.1]">
              Code together, <br />
              <span className="font-bold bg-gradient-to-r from-rose-400 via-cyan-400 to-rose-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient_3s_ease_infinite]">
                in real time.
              </span>
            </h1>

            <p className="mt-6 text-base text-white/50 max-w-lg leading-relaxed">
              Create workspaces, invite your team, and write HTML, CSS,
              JavaScript, Python, C++ and more —
              <span className="text-rose-400 font-medium"> together</span>, with
              live cursors and instant sync.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              {user ? (
                <Button
                  size="lg"
                  asChild
                  className="group bg-gradient-to-r from-rose-500 to-rose-400 hover:from-rose-400 hover:to-rose-300 text-white font-semibold px-10 rounded-2xl hover:shadow-2xl hover:shadow-rose-500/30 transition-all duration-300 border border-white/20"
                >
                  <Link to="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300" />
                  </Link>
                </Button>
              ) : (
                <Button
                  size="lg"
                  asChild
                  className="group bg-gradient-to-r from-rose-500 to-rose-400 hover:from-rose-400 hover:to-rose-300 text-white font-semibold px-10 rounded-2xl hover:shadow-2xl hover:shadow-rose-500/30 transition-all duration-300 border border-white/20"
                >
                  <Link to="/signup">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300" />
                  </Link>
                </Button>
              )}
              <Button
                size="lg"
                asChild
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-medium px-8 rounded-2xl border border-white/20 hover:border-rose-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-rose-500/10"
              >
                <Link to="/demo">
                  <Play className="mr-2 h-4 w-4" />
                  Watch Demo
                </Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-6 mt-8">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-[#0a0a0a] bg-gradient-to-br from-rose-400/30 to-cyan-400/30 flex items-center justify-center text-xs font-medium"
                  >
                    <User size={14} className="text-white/60" />
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-rose-400" />
                  <span className="text-sm text-white/60">
                    2,000+ developers trust us
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Code Preview */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-rose-500/20 to-cyan-500/20 rounded-3xl blur-2xl opacity-50"></div>
            <div className="relative bg-[#0d0d0d] rounded-3xl border border-white/10 overflow-hidden backdrop-blur-xl shadow-2xl">
              {/* Code Editor Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-xs text-white/30 font-mono">
                    index.js
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-white/30">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                    <span>2 collaborators</span>
                  </div>
                  <GitBranch size={14} className="text-white/20" />
                </div>
              </div>

              {/* Code Content */}
              <div className="p-4 font-mono text-sm">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-end text-white/20 select-none">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                      <span key={n} className="h-5">
                        {n}
                      </span>
                    ))}
                  </div>

                  <div className="flex-1 space-y-0.5 text-white/70">
                    <div>
                      <span className="text-rose-400">import</span> React{" "}
                      <span className="text-rose-400">from</span>{" "}
                      <span className="text-cyan-400">'react'</span>;
                    </div>
                    <div>
                      <span className="text-rose-400">import</span>{" "}
                      {"{ useState }"}{" "}
                      <span className="text-rose-400">from</span>{" "}
                      <span className="text-cyan-400">'react'</span>;
                    </div>
                    <div>&nbsp;</div>
                    <div>
                      <span className="text-rose-400">const</span>{" "}
                      <span className="text-yellow-400">App</span> = () =&gt;{" "}
                      {"{"}
                    </div>
                    <div>
                      {" "}
                      <span className="text-rose-400">const</span> [
                      <span className="text-cyan-400">count</span>,{" "}
                      <span className="text-cyan-400">setCount</span>] ={" "}
                      <span className="text-yellow-400">useState</span>(
                      <span className="text-rose-400">0</span>);
                    </div>
                    <div>&nbsp;</div>
                    <div>
                      {" "}
                      <span className="text-rose-400">return</span> (
                    </div>
                    <div>
                      {" "}
                      <span className="text-white/40">&lt;</span>
                      <span className="text-yellow-400">div</span>
                      <span className="text-white/40">&gt;</span>
                    </div>
                    <div>
                      {" "}
                      <span className="text-white/40">&lt;</span>
                      <span className="text-yellow-400">h1</span>
                      <span className="text-white/40">&gt;</span>
                    </div>
                    <div>
                      {" "}
                      Hello <span className="text-rose-400">World</span>!
                    </div>
                    <div>
                      {" "}
                      <span className="text-white/40">&lt;/</span>
                      <span className="text-yellow-400">h1</span>
                      <span className="text-white/40">&gt;</span>
                    </div>
                    <div>
                      {" "}
                      <span className="text-white/40">&lt;</span>
                      <span className="text-yellow-400">button</span>{" "}
                      <span className="text-cyan-400">onClick</span>=
                      <span className="text-white/40">
                        {"{() =&gt; setCount(count + 1)}"}
                      </span>
                      <span className="text-white/40">&gt;</span>
                    </div>
                    <div> Click me</div>
                    <div>
                      {" "}
                      <span className="text-white/40">&lt;/</span>
                      <span className="text-yellow-400">button</span>
                      <span className="text-white/40">&gt;</span>
                    </div>
                    <div>
                      {" "}
                      <span className="text-white/40">&lt;/</span>
                      <span className="text-yellow-400">div</span>
                      <span className="text-white/40">&gt;</span>
                    </div>
                    <div> );</div>
                    <div>{"}"}</div>
                    <div>&nbsp;</div>
                    <div>
                      <span className="text-rose-400">export</span>{" "}
                      <span className="text-rose-400">default</span> App;
                    </div>

                    {/* Animated cursor */}
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-0.5 h-4 bg-cyan-400 animate-pulse"></div>
                      <span className="text-xs text-cyan-400/60">
                        alex is typing...
                      </span>
                      <div className="flex gap-0.5 ml-1">
                        <div className="w-1 h-1 rounded-full bg-rose-400 animate-bounce"></div>
                        <div className="w-1 h-1 rounded-full bg-cyan-400 animate-bounce delay-100"></div>
                        <div className="w-1 h-1 rounded-full bg-rose-400 animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status bar */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-white/5 bg-white/5">
                <div className="flex items-center gap-4 text-xs text-white/20 font-mono">
                  <span className="flex items-center gap-1">
                    <Cpu size={12} />
                    <span>Ln 15, Col 8</span>
                  </span>
                  <span>UTF-8</span>
                  <span>JavaScript</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-white/20">
                  <span className="flex items-center gap-1">
                    <Shield size={12} />
                    <span>Live sync</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare size={12} />
                    <span>3 messages</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid sm:grid-cols-3 gap-5 mt-28 text-left">
          {features.map(({ icon: Icon, title, desc, gradient, bgGradient }) => (
            <Card
              key={title}
              className="group relative bg-white/5 backdrop-blur-xl border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden rounded-2xl hover:-translate-y-2 hover:shadow-2xl hover:shadow-rose-500/10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div
                className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500`}
              ></div>

              <CardContent className="relative pt-8 pb-8 px-6">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 bg-gradient-to-br ${bgGradient} group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="text-white" size={22} />
                </div>
                <h3 className="font-semibold text-lg tracking-tight text-white/90">
                  {title}
                </h3>
                <p className="text-white/40 text-sm mt-2 leading-relaxed">
                  {desc}
                </p>
                <div
                  className={`absolute bottom-0 left-6 right-6 h-[2px] bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-50 transition-opacity duration-500`}
                ></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-24 pt-10 border-t border-white/5">
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/5 hover:border-rose-400/20 transition-all duration-300 text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-rose-400 to-rose-300 bg-clip-text text-transparent">
                2K+
              </div>
              <div className="text-xs text-white/30 mt-1">Teams</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/5 hover:border-cyan-400/20 transition-all duration-300 text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent">
                50K+
              </div>
              <div className="text-xs text-white/30 mt-1">Sessions</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/5 hover:border-rose-400/20 transition-all duration-300 text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-rose-400 to-cyan-400 bg-clip-text text-transparent">
                99.9%
              </div>
              <div className="text-xs text-white/30 mt-1">Uptime</div>
            </div>
          </div>
        </div>
      </main>

      {/* Glass footer */}
      <footer className="relative max-w-7xl mx-auto px-6 py-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/30">
            © 2026 CodeCollab. Built with{" "}
            <span className="text-rose-400">❤</span> for developers.
          </p>
          <div className="flex gap-8 text-xs">
            <a
              href="#"
              className="text-white/30 hover:text-rose-400 transition-colors duration-300"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-white/30 hover:text-rose-400 transition-colors duration-300"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-white/30 hover:text-rose-400 transition-colors duration-300"
            >
              Support
            </a>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};

export default Landing;