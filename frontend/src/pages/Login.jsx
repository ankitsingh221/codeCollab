import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Code2, Loader2, AlertCircle, Sparkles, ArrowRight, Lock, Mail, Shield } from "lucide-react";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
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

  // Design tokens matching Landing page
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

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "#ECEDF0" }}
    >
      {/* Paper-grain texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.4]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(0,0,0,0.015) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-8 group cursor-pointer">
          <div
            className="relative p-2.5 rounded-xl transition-all duration-300 group-hover:scale-105"
            style={pressed}
          >
            <Code2 className="text-[#C1652F]" size={22} />
          </div>
          <span className="text-2xl font-bold tracking-tight transition-all duration-300 group-hover:scale-105" style={{ color: "#2B2B2F" }}>
            Code<span style={{ color: "#C1652F" }}>Collab</span>
          </span>
        </div>

        {/* Card with raised effect */}
        <Card 
          className="relative transition-all duration-300 hover:scale-[1.01]"
          style={{
            ...raised,
            borderRadius: "20px",
          }}
        >
          <CardHeader className="relative">
            <div
              className="inline-flex items-center gap-2 px-5 py-2 mb-4 w-fit rounded-full transition-all duration-300"
              style={pressed}
            >
              <Sparkles className="w-3 h-3" style={{ color: "#C1652F" }} />
              <span
                className="text-[11px] tracking-[0.15em] uppercase font-bold"
                style={{ color: "#6B6D75" }}
              >
                Welcome back
              </span>
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: "#C1652F" }}
              />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight" style={{ color: "#26262B" }}>
              Log in to your account
            </CardTitle>
            <CardDescription style={{ color: "#787B85" }}>
              Access your workspaces and continue coding.
            </CardDescription>
          </CardHeader>

          <CardContent className="relative">
            {error && (
              <Alert 
                className="mb-4 transition-all duration-300"
                style={{
                  ...pressed,
                  borderRadius: "12px",
                  border: "1px solid rgba(193,101,47,0.15)",
                }}
              >
                <AlertCircle className="h-4 w-4" style={{ color: "#C1652F" }} />
                <AlertDescription style={{ color: "#6B4A3A" }}>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2" style={{ color: "#4A4C53" }}>
                  <Mail className="w-3.5 h-3.5" style={{ color: "#C1652F" }} />
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="you@example.com"
                    className="transition-all duration-300"
                    style={{
                      ...(focusedField === 'email' ? pressed : raisedSm),
                      borderRadius: "12px",
                      border: focusedField === 'email' 
                        ? "2px solid #C1652F" 
                        : "1px solid rgba(255,255,255,0.5)",
                      color: "#2B2B2F",
                      padding: "12px 16px",
                      fontSize: "14px",
                      background: focusedField === 'email' 
                        ? "linear-gradient(160deg, #E3E5E9 0%, #F0F1F4 100%)"
                        : "linear-gradient(160deg, #F7F8FA 0%, #E7E9EC 100%)",
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2" style={{ color: "#4A4C53" }}>
                  <Lock className="w-3.5 h-3.5" style={{ color: "#C1652F" }} />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••"
                    className="transition-all duration-300"
                    style={{
                      ...(focusedField === 'password' ? pressed : raisedSm),
                      borderRadius: "12px",
                      border: focusedField === 'password' 
                        ? "2px solid #C1652F" 
                        : "1px solid rgba(255,255,255,0.5)",
                      color: "#2B2B2F",
                      padding: "12px 16px",
                      fontSize: "14px",
                      background: focusedField === 'password' 
                        ? "linear-gradient(160deg, #E3E5E9 0%, #F0F1F4 100%)"
                        : "linear-gradient(160deg, #F7F8FA 0%, #E7E9EC 100%)",
                    }}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full font-bold transition-all duration-300 hover:scale-[1.02] active:scale-95 group"
                style={{
                  background: "linear-gradient(160deg, #D07B47, #B0552A)",
                  boxShadow:
                    "6px 6px 14px rgba(163,167,178,0.5), -3px -3px 10px rgba(255,255,255,0.4), inset 0 1px 0 rgba(255,255,255,0.25)",
                  borderRadius: "14px",
                  color: "#FBF6F1",
                  border: "1px solid rgba(255,255,255,0.15)",
                  padding: "14px 20px",
                  fontSize: "16px",
                }}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Logging in..." : "Log In"}
                {!loading && (
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                )}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: "rgba(163,167,178,0.25)" }}></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span 
                  className="px-3" 
                  style={{ 
                    background: "linear-gradient(160deg, #F7F8FA 0%, #E5E7EB 100%)",
                    color: "#787B85"
                  }}
                >
                  or
                </span>
              </div>
            </div>

            <p className="text-sm text-center" style={{ color: "#787B85" }}>
              Don't have an account?{" "}
              <Link 
                to="/signup" 
                className="font-medium transition-all duration-300 hover:underline"
                style={{ color: "#C1652F" }}
              >
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="flex items-center justify-center gap-4 text-xs mt-6" style={{ color: "#787B85" }}>
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3" style={{ color: "#C1652F" }} />
            Secure login
          </span>
          <span className="w-px h-3" style={{ background: "rgba(163,167,178,0.25)" }}></span>
          <span>Encrypted connection</span>
        </div>
      </div>
    </div>
  );
};

export default Login;