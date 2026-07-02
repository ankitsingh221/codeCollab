import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Code2, Loader2, AlertCircle, Sparkles, ArrowRight } from "lucide-react";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0d0d0d] to-[#0a0a0a] text-white flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-[-300px] right-[-200px] w-[600px] h-[600px] rounded-full bg-rose-500/10 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-300px] left-[-200px] w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-rose-500/5 blur-3xl"></div>
      
      {/* Glass overlay lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M60 0 L0 0 0 60' fill='none' stroke='rgba(255,255,255,0.05)' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-8 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-cyan-400 rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
            <div className="relative bg-black/50 p-2.5 rounded-lg border border-white/10">
              <Code2 className="text-white" size={15} />
            </div>
          </div>
          <span className="text-2xl font-light tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            Code<span className="font-bold bg-gradient-to-r from-rose-400 to-cyan-400 bg-clip-text text-transparent">Collab</span>
          </span>
        </div>

        {/* Glass Card */}
        <Card className="relative bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl rounded-2xl overflow-hidden">
          {/* Card glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-cyan-500/5 pointer-events-none"></div>
          
          <CardHeader className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-xs text-white/60 tracking-wider uppercase mb-2 w-fit">
              <Sparkles className="w-3 h-3 text-rose-400" />
              <span className="bg-gradient-to-r from-rose-400 to-cyan-400 bg-clip-text text-transparent font-semibold">Welcome back</span>
            </div>
            <CardTitle className="text-2xl font-light text-white">
              Log in to your account
            </CardTitle>
            <CardDescription className="text-white/40">
              Access your workspaces and continue coding.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="relative">
            {error && (
              <Alert variant="destructive" className="mb-4 bg-rose-500/10 border-rose-500/20 text-rose-400">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-white/60 text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-rose-400/50 focus:ring-rose-400/20 rounded-xl transition-all duration-300"
                />
              </div>
              
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-white/60 text-sm font-medium">
                    Password
                  </Label>
                  <Link to="/forgot-password" className="text-xs text-white/30 hover:text-rose-400 transition-colors duration-300">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-rose-400/50 focus:ring-rose-400/20 rounded-xl transition-all duration-300"
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-gradient-to-r from-rose-500 to-rose-400 hover:from-rose-400 hover:to-rose-300 text-white font-semibold rounded-xl py-6 hover:shadow-xl hover:shadow-rose-500/25 transition-all duration-300 border border-white/20"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Logging in..." : "Log In"}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-[#0d0d0d] text-white/20">or</span>
              </div>
            </div>

            <p className="text-sm text-white/40 text-center">
              Don't have an account?{" "}
              <Link to="/signup" className="text-rose-400 hover:text-rose-300 font-medium hover:underline transition-all duration-300">
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Footer note */}
        <p className="text-xs text-white/20 text-center mt-6">
          Secure login · Encrypted connection
        </p>
      </div>

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

export default Login;