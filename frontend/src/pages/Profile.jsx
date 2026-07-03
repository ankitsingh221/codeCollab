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
import { 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Key, 
  Camera, 
  X,
  Save,
  RefreshCw
} from "lucide-react";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    currentPassword: "",
    newPassword: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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

  // Generate random avatar using DiceBear Avatars
  const generateRandomAvatar = () => {
    const styles = [
      'adventurer',
      'adventurer-neutral',
      'avataaars',
      'big-ears',
      'big-ears-neutral',
      'big-smile',
      'bottts',
      'bottts-neutral',
      'croodles',
      'croodles-neutral',
      'fun-emoji',
      'icons',
      'identicon',
      'initials',
      'lorelei',
      'lorelei-neutral',
      'micah',
      'miniavs',
      'notionists',
      'notionists-neutral',
      'open-peeps',
      'personas',
      'pixel-art',
      'pixel-art-neutral',
      'shapes',
      'thumbs'
    ];
    
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    const seed = user?.email || user?.name || Math.random().toString(36).substring(7);
    const randomSeed = Math.random().toString(36).substring(7);
    
    return `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${seed}-${randomSeed}`;
  };

  // Update avatar with random avatar
  const handleGenerateAvatar = async () => {
    setUploadingAvatar(true);
    setMessage({ type: "", text: "" });
    
    try {
      const randomAvatarUrl = generateRandomAvatar();
      
      // Update user with new avatar URL
      const { data } = await axiosClient.patch("/users/me", { 
        avatarUrl: randomAvatarUrl 
      });
      
      updateUser(data.user);
      setMessage({ type: "success", text: "Avatar generated successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to generate avatar." });
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Method 2: Upload avatar via file input
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: "error", text: "Please upload an image file." });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image size should be less than 5MB." });
      return;
    }

    setUploadingAvatar(true);
    setMessage({ type: "", text: "" });

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const { data } = await axiosClient.post('/users/me/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      updateUser(data.user);
      setMessage({ type: "success", text: "Avatar updated successfully." });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to upload avatar." });
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Remove avatar
  const handleRemoveAvatar = async () => {
    if (!confirm("Are you sure you want to remove your avatar?")) return;

    setUploadingAvatar(true);
    try {
      const { data } = await axiosClient.delete('/users/me/avatar');
      updateUser(data.user);
      setMessage({ type: "success", text: "Avatar removed successfully." });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to remove avatar." });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Get current avatar URL with fallback
  const avatarUrl = user?.avatarUrl || generateRandomAvatar();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white px-4 py-12 relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-500/[0.03] to-cyan-500/[0.03]"></div>
      
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M60 0 L0 0 0 60' fill='none' stroke='rgba(255,255,255,0.05)' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-lg mx-auto relative z-10">
        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-8 p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl">
          <div className="relative group">
            <Avatar className="h-20 w-20 border-2 border-white/10 transition-all duration-300 group-hover:border-rose-400/50">
              <AvatarImage src={avatarUrl} alt={user?.name} />
              <AvatarFallback className="bg-gradient-to-br from-rose-500/20 to-cyan-500/20 text-white text-xl font-medium">
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
            
            {/* Avatar action buttons */}
            <div className="absolute -bottom-1 -right-1 flex gap-1">
              <button
                onClick={handleGenerateAvatar}
                disabled={uploadingAvatar}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-300 backdrop-blur-sm"
                title="Generate random avatar"
              >
                <RefreshCw className={`w-3 h-3 text-white/60 ${uploadingAvatar ? 'animate-spin' : ''}`} />
              </button>
            </div>
            
            {/* Hidden file input */}
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />

            {/* Remove avatar button (only if avatar exists) */}
            {user?.avatarUrl && (
              <button
                onClick={handleRemoveAvatar}
                className="absolute -top-1 -right-1 p-1 rounded-full bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/30 transition-all duration-300"
                title="Remove avatar"
                disabled={uploadingAvatar}
              >
                <X className="w-3 h-3 text-rose-400" />
              </button>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-white truncate">
              {user?.name}
            </h1>
            <p className="text-white/40 text-sm truncate">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="text-xs text-white/30">Active</span>
            </div>
          </div>
        </div>

        {/* Glass Card */}
        <Card className="relative bg-white/5 backdrop-blur-xl border-white/10 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="relative pb-4">
            <CardTitle className="text-xl font-light text-white">
              Edit Profile
            </CardTitle>
            <CardDescription className="text-white/40 text-sm">
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
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                }`}
              >
                {message.type === "error" ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                <AlertDescription className="text-sm">{message.text}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Personal Information */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-white/20" />
                  <span className="text-xs font-medium text-white/30 uppercase tracking-wider">Personal Information</span>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-white/50 text-sm">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-rose-400/40 focus:ring-rose-400/20 rounded-xl transition-all duration-300 h-10"
                  />
                </div>
              </div>

              <Separator className="bg-white/5" />

              {/* Change Password */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-white/20" />
                  <span className="text-xs font-medium text-white/30 uppercase tracking-wider">Change Password</span>
                  <span className="text-[10px] text-white/20 ml-auto">optional</span>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="currentPassword" className="text-white/50 text-sm">
                    Current Password
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    name="currentPassword"
                    value={form.currentPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-rose-400/40 focus:ring-rose-400/20 rounded-xl transition-all duration-300 h-10"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className="text-white/50 text-sm">
                    New Password
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    name="newPassword"
                    value={form.newPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-rose-400/40 focus:ring-rose-400/20 rounded-xl transition-all duration-300 h-10"
                  />
                  <p className="text-[10px] text-white/20">
                    Leave blank to keep current password
                  </p>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-gradient-to-r from-rose-500/90 to-rose-400/90 hover:from-rose-400 hover:to-rose-300 text-white font-medium rounded-xl h-11 hover:shadow-lg hover:shadow-rose-500/20 transition-all duration-300 border border-white/10"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer note */}
        <p className="text-xs text-white/10 text-center mt-6">
          Your data is securely encrypted
        </p>
      </div>
    </div>
  );
};

export default Profile;