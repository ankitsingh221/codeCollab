import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { workspaceApi } from '../api/workspaceApi';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '../context/ToastContext';

import {
  Plus,
  FolderPlus,
  Users,
  Code2,
  Loader2,
  Trash2,
  ArrowRight,
  Sparkles,
  User,
  Calendar,
  LogOut,
  ChevronDown,
  AlertTriangle,
  X,
  UserCog,
  Crown,
} from 'lucide-react';
import CreateWorkspaceModal from '../components/CreateWorkspaceModal';
import PendingInvitations from '../components/PendingInvitations';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    setLoading(true);
    try {
      const response = await workspaceApi.getWorkspaces();
      
      // Process workspaces to ensure they have memberCount
      const processedWorkspaces = response.data.workspaces.map(ws => {
        // If memberCount doesn't exist, try to get it from members array
        if (!ws.memberCount && ws.members) {
          ws.memberCount = Array.isArray(ws.members) ? ws.members.length : 0;
        }
        // If still no memberCount, set to 1 (at least the owner is a member)
        if (!ws.memberCount) {
          ws.memberCount = 1; // At least the owner
        }
        return ws;
      });
      
      setWorkspaces(processedWorkspaces || []);
      
       toast({
      title: "Success",
      description: `Loaded ${processedWorkspaces.length} workspaces`,
      variant: "success"
    });
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch workspaces.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkspace = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    try {
      await workspaceApi.deleteWorkspace(id);
      setWorkspaces(workspaces.filter(w => w._id !== id));
      toast({
        title: "Workspace Deleted",
        description: `"${name}" has been deleted successfully.`,
        variant: "success"
      });
    } catch (error) {
      console.error('Error deleting workspace:', error);
      toast({
        title: "Delete Failed",
        description: error.response?.data?.message || 'Failed to delete workspace. Please try again.',
        variant: "destructive"
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleWorkspaceCreated = (newWorkspace) => {
    setWorkspaces([newWorkspace, ...workspaces]);
    setShowCreateModal(false);
    toast({
      title: "Workspace Created",
      description: `"${newWorkspace.name}" has been created successfully.`,
      variant: "success"
    });
  };

  const handleLogout = async () => {
    setShowLogoutDialog(false);
    setShowUserMenu(false);
    try {
      await logout();
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully.",
        variant: "success"
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout Failed",
        description: "Something went wrong during logout. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Calculate stats
  const totalWorkspaces = workspaces.length;
  const totalMembers = workspaces.reduce((acc, w) => {
    // Get member count from various sources
    let count = w.memberCount || 0;
    if (!count && w.members) {
      count = Array.isArray(w.members) ? w.members.length : 0;
    }
    if (!count) count = 1; // At least the owner
    return acc + count;
  }, 0);
  
  const ownerWorkspaces = workspaces.filter(w => {
    const ownerId = w.owner?._id || w.owner || w.createdBy;
    if (typeof ownerId === 'object' && ownerId !== null) {
      return ownerId._id === user?._id;
    }
    return ownerId === user?._id || ownerId === user?._id?.toString();
  }).length;

  // Generate avatar URL with fallback
  const getAvatarUrl = () => {
    if (user?.avatarUrl) return user.avatarUrl;
    const seed = user?.email || user?.name || 'user';
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Helper function to check if user is the owner
  const isWorkspaceOwner = (workspace) => {
    if (!user?._id) return false;
    
    const ownerId = workspace.owner?._id || workspace.owner || workspace.createdBy;
    
    if (typeof ownerId === 'object' && ownerId !== null) {
      return ownerId._id === user._id || ownerId === user._id;
    }
    
    return ownerId === user._id || ownerId === user._id?.toString();
  };

  // Helper function to get user's role in workspace
  const getUserRole = (workspace) => {
    // Check myRole first (from backend)
    if (workspace.myRole) {
      if (workspace.myRole === 'owner' || workspace.myRole === 'admin') {
        return { 
          label: 'Owner', 
          icon: Crown, 
          color: 'text-rose-400', 
          bg: 'bg-rose-500/20', 
          border: 'border-rose-500/20' 
        };
      }
      // Capitalize first letter of role
      const roleLabel = workspace.myRole.charAt(0).toUpperCase() + workspace.myRole.slice(1);
      return { 
        label: roleLabel, 
        icon: UserCog, 
        color: 'text-cyan-400', 
        bg: 'bg-cyan-500/20', 
        border: 'border-cyan-500/20' 
      };
    }
    
    // Fallback to owner check
    if (isWorkspaceOwner(workspace)) {
      return { 
        label: 'Owner', 
        icon: Crown, 
        color: 'text-rose-400', 
        bg: 'bg-rose-500/20', 
        border: 'border-rose-500/20' 
      };
    }
    
    return { 
      label: 'Member', 
      icon: UserCog, 
      color: 'text-cyan-400', 
      bg: 'bg-cyan-500/20', 
      border: 'border-cyan-500/20' 
    };
  };

  // Get member count safely - IMPROVED
  const getMemberCount = (workspace) => {
    // Check if memberCount exists
    if (workspace.memberCount !== undefined && workspace.memberCount !== null) {
      return workspace.memberCount;
    }
    
    // Check if members array exists
    if (workspace.members && Array.isArray(workspace.members)) {
      return workspace.members.length;
    }
    
    // Check if members is an object
    if (workspace.members && typeof workspace.members === 'object') {
      return Object.keys(workspace.members).length;
    }
    
    // Default: at least the owner is a member
    return 1;
  };

  // Get members array safely
  const getMembers = (workspace) => {
    if (workspace.members && Array.isArray(workspace.members)) {
      return workspace.members;
    }
    
    if (workspace.members && typeof workspace.members === 'object') {
      return Object.values(workspace.members);
    }
    
    // If no members array, return owner as member
    if (workspace.owner) {
      return [workspace.owner];
    }
    
    return [];
  };

  // Get owner name for display
  const getOwnerName = (workspace) => {
    if (workspace.owner?.name) return workspace.owner.name;
    if (workspace.owner?.username) return workspace.owner.username;
    if (workspace.owner?.email) return workspace.owner.email;
    if (typeof workspace.owner === 'string') return workspace.owner;
    return 'Unknown';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0d0d0d] to-[#0a0a0a] text-white relative overflow-hidden">
      {/* Glass overlay lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M60 0 L0 0 0 60' fill='none' stroke='rgba(255,255,255,0.05)' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Navbar */}
      <nav className="relative z-10 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-cyan-400 rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                  <div className="relative bg-black/50 p-2 rounded-lg border border-white/10">
                    <Code2 className="text-white" size={15} />
                  </div>
                </div>
                <span className="text-lg font-light tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                  Code<span className="font-bold bg-gradient-to-r from-rose-400 to-cyan-400  bg-clip-text text-transparent">Collab</span>
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              {/* User Profile Button with Avatar */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-white/10 transition-all duration-300 group"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-cyan-400  rounded-full blur-sm opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
                    <Avatar className="h-8 w-8 border-2 border-white/10 group-hover:border-rose-400/50 transition-all duration-300 relative">
                      <AvatarImage src={getAvatarUrl()} alt={user?.name} />
                      <AvatarFallback className="bg-gradient-to-br from-rose-500/20 to-cyan-500/20 text-white text-xs font-medium">
                        {getInitials(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-medium text-white/90 leading-tight">
                      {user?.name}
                    </span>
                    <span className="text-[10px] text-white/30">Online</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-white/30 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowUserMenu(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#1a1a1a] border border-white/10 shadow-2xl overflow-hidden z-50">
                      <div className="p-3 border-b border-white/5">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-white/10">
                            <AvatarImage src={getAvatarUrl()} alt={user?.name} />
                            <AvatarFallback className="bg-gradient-to-br from-rose-500/20 to-cyan-500/20 text-white text-sm font-medium">
                              {getInitials(user?.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-white/90">{user?.name}</p>
                            <p className="text-xs text-white/30 truncate max-w-[140px]">{user?.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-1">
                        <Link to="/profile" onClick={() => setShowUserMenu(false)}>
                          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300">
                            <User className="w-4 h-4 text-white/30" />
                            Profile Settings
                          </button>
                        </Link>
                      </div>
                      <div className="border-t border-white/5 p-1">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            setShowLogoutDialog(true);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all duration-300"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
       
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <PendingInvitations onAccepted={fetchWorkspaces} />
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-light tracking-tight">
              Welcome back, <span className="font-bold bg-gradient-to-r from-rose-400 to-cyan-400 bg-clip-text text-transparent">{user?.name}</span>
            </h1>
            <p className="text-sm text-white/40">Manage your workspaces and collaborate with your team</p>
          </div>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-rose-700/80 to-rose-500/80 hover:from-rose-500/50 hover:to-rose-300 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-rose-500/25 transition-all duration-300 border border-white/20"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Workspace
          </Button>
        </div>

        {/* Workspace Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/5 hover:border-rose-400/20 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-500/10 rounded-lg">
                <FolderPlus className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{totalWorkspaces}</div>
                <div className="text-xs text-white/40">Total Workspaces</div>
              </div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/5 hover:border-cyan-400/20 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/10 rounded-lg">
                <Users className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{totalMembers}</div>
                <div className="text-xs text-white/40">Total Members</div>
              </div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/5 hover:border-purple-400/20 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{ownerWorkspaces}</div>
                <div className="text-xs text-white/40">Owned Workspaces</div>
              </div>
            </div>
          </div>
        </div>

        {/* Workspace Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-rose-400" />
          </div>
        ) : workspaces.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <FolderPlus className="w-10 h-10 text-white/20" />
            </div>
            <h3 className="text-xl font-light text-white/60 mb-2">No workspaces yet</h3>
            <p className="text-white/30 text-sm mb-6 max-w-md mx-auto">
              Create your first workspace to start collaborating with your team. 
              You can invite members and start coding together in real-time.
            </p>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-rose-500 to-rose-400 hover:from-rose-400 hover:to-rose-300 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-rose-500/25 transition-all duration-300 border border-white/20"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Workspace
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {workspaces.map((workspace) => {
              const isOwner = isWorkspaceOwner(workspace);
              const role = getUserRole(workspace);
              const RoleIcon = role.icon;
              const memberCount = getMemberCount(workspace);
              const members = getMembers(workspace);
              const ownerName = getOwnerName(workspace);
              
              return (
                <div 
                  key={workspace.id || workspace._id}
                  className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-xl hover:shadow-white/5"
                >
                  {/* Subtle gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-500/0 via-cyan-500/0 to-transparent transition-all duration-500 hover:from-rose-500/5 hover:via-cyan-500/5"></div>
                  
                  <div className="relative p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-white/90 truncate transition-colors duration-300 hover:text-white">
                          {workspace.name}
                        </h3>
                        {workspace.description && (
                          <p className="text-sm text-white/30 mt-1 line-clamp-2 transition-colors duration-300 hover:text-white/40">
                            {workspace.description}
                          </p>
                        )}
                      </div>
                      {isOwner && (
                        <button
                          onClick={() => handleDeleteWorkspace(workspace.id || workspace._id, workspace.name)}
                          disabled={deletingId === (workspace.id || workspace._id)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-white/20 hover:text-rose-400 transition-all duration-300 disabled:opacity-50"
                        >
                          {deletingId === (workspace.id || workspace._id) ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-sm text-white/30">
                      <div className="flex items-center gap-1.5 transition-colors duration-300 hover:text-white/50">
                        <Users className="w-4 h-4" />
                        <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(workspace.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="mt-1 text-xs text-white/20">
                      Created by {ownerName}
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {members.length > 0 ? (
                          members.slice(0, 4).map((member, index) => {
                            const memberName = member.name || member.username || 'User';
                            const memberEmail = member.email || '';
                            const initial = memberName?.charAt(0).toUpperCase() || 
                                          memberEmail?.charAt(0).toUpperCase() || 
                                          'U';
                            const displayName = memberName || memberEmail || 'User';
                            
                            return (
                              <div
                                key={index}
                                className="w-7 h-7 rounded-full border-2 border-[#0a0a0a] bg-white/10 flex items-center justify-center text-xs font-medium text-white/50 transition-all duration-300 hover:scale-110 hover:bg-white/20 hover:border-white/20"
                                title={displayName}
                              >
                                {initial}
                              </div>
                            );
                          })
                        ) : (
                          <div
                            className="w-7 h-7 rounded-full border-2 border-[#0a0a0a] bg-white/10 flex items-center justify-center text-xs font-medium text-white/50 transition-all duration-300 hover:scale-110 hover:bg-white/20 hover:border-white/20"
                            title={ownerName}
                          >
                            {ownerName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {memberCount > 4 && (
                          <div className="w-7 h-7 rounded-full border-2 border-[#0a0a0a] bg-white/5 flex items-center justify-center text-xs text-white/30 transition-all duration-300 hover:bg-white/10">
                            +{memberCount - 4}
                          </div>
                        )}
                      </div>

                      <Link to={`/workspace/${workspace.id || workspace._id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300 text-sm group"
                        >
                          Open
                          <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                        </Button>
                      </Link>
                    </div>

                    {/* Role Badge */}
                    <div className="absolute top-4 right-14">
                      <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${role.bg} ${role.color} border ${role.border} flex items-center gap-1 transition-all duration-300 hover:scale-105`}>
                        <RoleIcon className="w-3 h-3" />
                        {role.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onWorkspaceCreated={handleWorkspaceCreated}
      />

      {/* Logout Confirmation Dialog */}
      {showLogoutDialog && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
            onClick={() => setShowLogoutDialog(false)}
          ></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
              {/* Card Header */}
              <div className="flex items-start justify-between p-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-500/10 rounded-xl">
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Confirm Logout</h3>
                    <p className="text-sm text-white/40">Are you sure you want to sign out?</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLogoutDialog(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white/60 transition-all duration-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <div className="flex items-center gap-4 p-4 bg-rose-500/5 rounded-xl border border-rose-500/10">
                  <div className="flex-1">
                    <p className="text-sm text-white/60">
                      You will be signed out of your account and redirected to the login page.
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-white/30">
                        Session will be terminated
                      </span>
                    </div>
                  </div>
                </div>

                {/* User info preview */}
                <div className="flex items-center gap-3 mt-4 p-3 bg-white/5 rounded-xl">
                  <Avatar className="h-8 w-8 border border-white/10">
                    <AvatarImage src={getAvatarUrl()} alt={user?.name} />
                    <AvatarFallback className="bg-gradient-to-br from-rose-500/20 to-cyan-500/20 text-white text-xs font-medium">
                      {getInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-white/80">{user?.name}</p>
                    <p className="text-xs text-white/30">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 p-6 border-t border-white/5 bg-white/5 rounded-b-2xl">
                <Button
                  variant="ghost"
                  onClick={() => setShowLogoutDialog(false)}
                  className="flex-1 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleLogout}
                  className="flex-1 bg-gradient-to-r from-rose-500 to-rose-400 hover:from-rose-400 hover:to-rose-300 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-rose-500/25 transition-all duration-300 border border-white/20"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Yes, Logout
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoom-in-95 {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-in {
          animation-duration: 200ms;
          animation-fill-mode: both;
        }
        .fade-in {
          animation-name: fade-in;
        }
        .zoom-in-95 {
          animation-name: zoom-in-95;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;