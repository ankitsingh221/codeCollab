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
  X,
  Save,
  RefreshCw,
  Shield,
  Mail
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
  const [focusedField, setFocusedField] = useState(null);

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

  const generateRandomAvatar = () => {
    const styles = [
      'adventurer', 'avataaars', 'big-ears', 'big-smile',
      'bottts', 'croodles', 'fun-emoji', 'identicon',
      'lorelei', 'micah', 'miniavs', 'notionists',
      'open-peeps', 'personas', 'pixel-art', 'shapes'
    ];
    
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    const seed = user?.email || user?.name || Math.random().toString(36).substring(7);
    const randomSeed = Math.random().toString(36).substring(7);
    
    return `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${seed}-${randomSeed}`;
  };

  const handleGenerateAvatar = async () => {
    setUploadingAvatar(true);
    setMessage({ type: "", text: "" });
    
    try {
      const randomAvatarUrl = generateRandomAvatar();
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

  const avatarUrl = user?.avatarUrl || generateRandomAvatar();

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
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

      <div className="max-w-lg mx-auto relative z-10 w-full">
        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-6 p-5 rounded-[20px] transition-all duration-300 hover:scale-[1.01]" style={raised}>
          <div className="relative group">
            <Avatar className="h-20 w-20 border-2 transition-all duration-300" style={{ borderColor: 'rgba(163,167,178,0.3)' }}>
              <AvatarImage src={avatarUrl} alt={user?.name} />
              <AvatarFallback className="text-xl font-medium" style={{ color: '#2B2B2F' }}>
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="absolute -bottom-1 -right-1 flex gap-1">
              <button
                onClick={handleGenerateAvatar}
                disabled={uploadingAvatar}
                className="p-1.5 rounded-full transition-all duration-300 hover:scale-110 active:scale-95"
                style={raisedSm}
                title="Generate random avatar"
              >
                <RefreshCw className={`w-3 h-3 ${uploadingAvatar ? 'animate-spin' : ''}`} style={{ color: '#C1652F' }} />
              </button>
            </div>
            
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />

            {user?.avatarUrl && (
              <button
                onClick={handleRemoveAvatar}
                className="absolute -top-1 -right-1 p-1 rounded-full transition-all duration-300 hover:scale-110 active:scale-95"
                style={{
                  background: 'linear-gradient(160deg, #F7F8FA 0%, #E7E9EC 100%)',
                  border: '1px solid rgba(193,101,47,0.2)',
                  boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.7), inset -1px -1px 2px rgba(0,0,0,0.05)'
                }}
                title="Remove avatar"
                disabled={uploadingAvatar}
              >
                <X className="w-3 h-3" style={{ color: '#C1652F' }} />
              </button>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate" style={{ color: '#2B2B2F' }}>
              {user?.name}
            </h1>
            <p className="text-sm truncate flex items-center gap-1" style={{ color: '#787B85' }}>
              <Mail className="w-3 h-3" style={{ color: '#C1652F' }} />
              {user?.email}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#6B9E6B' }}></span>
              <span className="text-xs" style={{ color: '#787B85' }}>Active</span>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <Card className="relative rounded-[20px] transition-all duration-300 hover:scale-[1.01]" style={raised}>
          <CardHeader className="relative pb-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-3 w-fit rounded-full" style={pressed}>
              <Shield className="w-3 h-3" style={{ color: '#C1652F' }} />
              <span className="text-[11px] tracking-[0.15em] uppercase font-bold" style={{ color: '#6B6D75' }}>
                Profile Settings
              </span>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#C1652F' }} />
            </div>
            <CardTitle className="text-xl font-bold tracking-tight" style={{ color: '#26262B' }}>
              Edit Profile
            </CardTitle>
            <CardDescription className="text-sm" style={{ color: '#787B85' }}>
              Update your personal information and password.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="relative">
            {message.text && (
              <Alert 
                className={`mb-4 rounded-xl transition-all duration-300 ${
                  message.type === "error" 
                    ? "border-red-200/20" 
                    : "border-green-200/20"
                }`}
                style={{
                  ...pressed,
                  border: message.type === "error"
                    ? '1px solid rgba(193,101,47,0.15)'
                    : '1px solid rgba(107,158,107,0.15)',
                }}
              >
                {message.type === "error" ? (
                  <AlertCircle className="h-4 w-4" style={{ color: '#C1652F' }} />
                ) : (
                  <CheckCircle2 className="h-4 w-4" style={{ color: '#6B9E6B' }} />
                )}
                <AlertDescription className="text-sm" style={{
                  color: message.type === "error" ? '#6B4A3A' : '#3A6B3A'
                }}>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" style={{ color: '#C1652F' }} />
                  <span className="text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: '#787B85' }}>
                    Personal Information
                  </span>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2" style={{ color: '#4A4C53' }}>
                    <User className="w-3.5 h-3.5" style={{ color: '#C1652F' }} />
                    Full Name
                  </Label>
                  <div className="relative">
                    <Input
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      className="transition-all duration-300"
                      style={{
                        ...(focusedField === 'name' ? pressed : raisedSm),
                        borderRadius: "12px",
                        border: focusedField === 'name' 
                          ? "2px solid #C1652F" 
                          : "1px solid rgba(255,255,255,0.5)",
                        color: '#2B2B2F',
                        padding: '12px 16px',
                        fontSize: '14px',
                        height: '42px',
                        background: focusedField === 'name' 
                          ? "linear-gradient(160deg, #E3E5E9 0%, #F0F1F4 100%)"
                          : "linear-gradient(160deg, #F7F8FA 0%, #E7E9EC 100%)",
                      }}
                    />
                  </div>
                </div>
              </div>

              <Separator style={{ background: 'rgba(163,167,178,0.2)' }} />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4" style={{ color: '#C1652F' }} />
                  <span className="text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: '#787B85' }}>
                    Change Password
                  </span>
                  <span className="text-[10px] ml-auto" style={{ color: '#787B85' }}>optional</span>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="currentPassword" className="text-sm font-medium" style={{ color: '#4A4C53' }}>
                    Current Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type="password"
                      name="currentPassword"
                      value={form.currentPassword}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('currentPassword')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="••••••••"
                      className="transition-all duration-300"
                      style={{
                        ...(focusedField === 'currentPassword' ? pressed : raisedSm),
                        borderRadius: "12px",
                        border: focusedField === 'currentPassword' 
                          ? "2px solid #C1652F" 
                          : "1px solid rgba(255,255,255,0.5)",
                        color: '#2B2B2F',
                        padding: '12px 16px',
                        fontSize: '14px',
                        height: '42px',
                        background: focusedField === 'currentPassword' 
                          ? "linear-gradient(160deg, #E3E5E9 0%, #F0F1F4 100%)"
                          : "linear-gradient(160deg, #F7F8FA 0%, #E7E9EC 100%)",
                      }}
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className="text-sm font-medium" style={{ color: '#4A4C53' }}>
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type="password"
                      name="newPassword"
                      value={form.newPassword}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('newPassword')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="••••••••"
                      className="transition-all duration-300"
                      style={{
                        ...(focusedField === 'newPassword' ? pressed : raisedSm),
                        borderRadius: "12px",
                        border: focusedField === 'newPassword' 
                          ? "2px solid #C1652F" 
                          : "1px solid rgba(255,255,255,0.5)",
                        color: '#2B2B2F',
                        padding: '12px 16px',
                        fontSize: '14px',
                        height: '42px',
                        background: focusedField === 'newPassword' 
                          ? "linear-gradient(160deg, #E3E5E9 0%, #F0F1F4 100%)"
                          : "linear-gradient(160deg, #F7F8FA 0%, #E7E9EC 100%)",
                      }}
                    />
                  </div>
                  <p className="text-[10px]" style={{ color: '#787B85' }}>
                    Leave blank to keep current password
                  </p>
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
                  padding: '12px 20px',
                  fontSize: '15px',
                  height: '48px'
                }}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-xs text-center mt-6 transition-all duration-300 hover:scale-[1.02]" style={{ color: '#787B85' }}>
          <Shield className="w-3 h-3 inline mr-1" style={{ color: '#C1652F' }} />
          Your data is securely encrypted
        </p>
      </div>
    </div>
  );
};

export default Profile;