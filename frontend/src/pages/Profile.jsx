import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import axiosClient from "../api/axiosClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Loader2, CheckCircle2, AlertCircle, User, Key, Sparkles, ArrowRight } from "lucide-react";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    avatarUrl: user?.avatarUrl || "",
    currentPassword: "",
    newPassword: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setLoading(true);
    try {
      const { data } = await axiosClient.patch("/users/me", form);
      updateUser(data.user);
      setForm({ ...form, currentPassword: "", newPassword: "" });
      setMessage({ type: "success", text: "Profile updated successfully." });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Update failed." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0d0d0d] to-[#0a0a0a] text-white px-4 py-12 relative overflow-hidden">
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

      <div className="max-w-lg mx-auto relative z-10">
        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-8 p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-cyan-400 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
            <Avatar className="h-16 w-16 relative border-2 border-white/10">
              <AvatarImage src={user?.avatarUrl} alt={user?.name} />
              <AvatarFallback className="bg-gradient-to-br from-rose-500/30 to-cyan-500/30 text-white text-lg font-medium">
                {user?.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              {user?.name}
            </h1>
            <p className="text-white/40 text-sm">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-xs text-white/30">Active</span>
            </div>
          </div>
        </div>

        {/* Glass Card */}
        <Card className="relative bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl rounded-2xl overflow-hidden">
          {/* Card glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-cyan-500/5 pointer-events-none"></div>
          
          <CardHeader className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-xs text-white/60 tracking-wider uppercase mb-2 w-fit">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span className="bg-gradient-to-r from-rose-400 to-cyan-400 bg-clip-text text-transparent font-semibold">Profile Settings</span>
            </div>
            <CardTitle className="text-2xl font-light text-white">
              Edit Profile
            </CardTitle>
            <CardDescription className="text-white/40">
              Update your personal information and password.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="relative">
            {message.text && (
              <Alert 
                variant={message.type === "error" ? "destructive" : "default"} 
                className={`mb-4 ${
                  message.type === "error" 
                    ? "bg-rose-500/10 border-rose-500/20 text-rose-400" 
                    : "bg-green-500/10 border-green-500/20 text-green-400"
                }`}
              >
                {message.type === "error" ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Personal Information */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-white/20" />
                  <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Personal Information</span>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-white/60 text-sm font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-rose-400/50 focus:ring-rose-400/20 rounded-xl transition-all duration-300"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="avatarUrl" className="text-white/60 text-sm font-medium">
                    Avatar URL
                  </Label>
                  <Input
                    id="avatarUrl"
                    name="avatarUrl"
                    value={form.avatarUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/avatar.jpg"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-rose-400/50 focus:ring-rose-400/20 rounded-xl transition-all duration-300"
                  />
                </div>
              </div>

              <Separator className="bg-white/5 my-4" />

              {/* Change Password */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-white/20" />
                  <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Change Password</span>
                  <span className="text-[10px] text-white/20 ml-auto">(optional)</span>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="currentPassword" className="text-white/60 text-sm font-medium">
                    Current Password
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    name="currentPassword"
                    value={form.currentPassword}
                    onChange={handleChange}
                    placeholder="Enter current password"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-rose-400/50 focus:ring-rose-400/20 rounded-xl transition-all duration-300"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className="text-white/60 text-sm font-medium">
                    New Password
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    name="newPassword"
                    value={form.newPassword}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-rose-400/50 focus:ring-rose-400/20 rounded-xl transition-all duration-300"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-gradient-to-r from-rose-500 to-rose-400 hover:from-rose-400 hover:to-rose-300 text-white font-semibold rounded-xl py-6 hover:shadow-xl hover:shadow-rose-500/25 transition-all duration-300 border border-white/20 mt-2"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Saving Changes..." : "Save Changes"}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer note */}
        <p className="text-xs text-white/20 text-center mt-6">
          Your data is securely encrypted
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

export default Profile;