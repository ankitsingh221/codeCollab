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
  Mail,
  Shield,
  Pencil,
} from 'lucide-react';
import CreateWorkspaceModal from '../components/CreateWorkspaceModal';
import PendingInvitations from '../components/PendingInvitations';
import { connectSocket } from '../socket/socket';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [hoveredWorkspace, setHoveredWorkspace] = useState(null);
  const { toast } = useToast();

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

  useEffect(() => {
    fetchWorkspaces();

    const socket = connectSocket();

    const handleAccepted = ({ user: acceptedUser }) => {
      fetchWorkspaces();
      if (acceptedUser?.name) {
        toast({
          title: "Invitation Accepted",
          description: `${acceptedUser.name} joined your workspace!`,
          variant: "success",
        });
      }
    };

    socket.on("invitation:accepted", handleAccepted);

    return () => {
      socket.off("invitation:accepted", handleAccepted);
    };
  }, []);

  const fetchWorkspaces = async () => {
    setLoading(true);
    try {
      const response = await workspaceApi.getWorkspaces();
      
      const processedWorkspaces = response.data.workspaces.map(ws => {
        if (!ws.memberCount && ws.members) {
          ws.memberCount = Array.isArray(ws.members) ? ws.members.length : 0;
        }
        if (!ws.memberCount) {
          ws.memberCount = 1;
        }
        return ws;
      });
      
      setWorkspaces(processedWorkspaces || []);
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

  const totalWorkspaces = workspaces.length;
  const totalMembers = workspaces.reduce((acc, w) => {
    let count = w.memberCount || 0;
    if (!count && w.members) {
      count = Array.isArray(w.members) ? w.members.length : 0;
    }
    if (!count) count = 1;
    return acc + count;
  }, 0);
  
  const ownerWorkspaces = workspaces.filter(w => {
    const ownerId = w.owner?._id || w.owner || w.createdBy;
    if (typeof ownerId === 'object' && ownerId !== null) {
      return ownerId._id === user?._id;
    }
    return ownerId === user?._id || ownerId === user?._id?.toString();
  }).length;

  const getAvatarUrl = () => {
    if (user?.avatarUrl) return user.avatarUrl;
    const seed = user?.email || user?.name || 'user';
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const isWorkspaceOwner = (workspace) => {
    if (!user?._id) return false;
    const ownerId = workspace.owner?._id || workspace.owner || workspace.createdBy;
    if (typeof ownerId === 'object' && ownerId !== null) {
      return ownerId._id === user._id || ownerId === user._id;
    }
    return ownerId === user._id || ownerId === user._id?.toString();
  };

  const getUserRole = (workspace) => {
    if (workspace.myRole) {
      if (workspace.myRole === 'owner' || workspace.myRole === 'admin') {
        return { 
          label: 'Owner', 
          icon: Crown, 
          color: '#C1652F',
          bg: 'rgba(193,101,47,0.15)',
          border: 'rgba(193,101,47,0.25)'
        };
      }
      const roleLabel = workspace.myRole.charAt(0).toUpperCase() + workspace.myRole.slice(1);
      return { 
        label: roleLabel, 
        icon: UserCog, 
        color: '#2C7A7A',
        bg: 'rgba(44,122,122,0.15)',
        border: 'rgba(44,122,122,0.25)'
      };
    }
    if (isWorkspaceOwner(workspace)) {
      return { 
        label: 'Owner', 
        icon: Crown, 
        color: '#C1652F',
        bg: 'rgba(193,101,47,0.15)',
        border: 'rgba(193,101,47,0.25)'
      };
    }
    return { 
      label: 'Member', 
      icon: UserCog, 
      color: '#2C7A7A',
      bg: 'rgba(44,122,122,0.15)',
      border: 'rgba(44,122,122,0.25)'
    };
  };

  const getMemberCount = (workspace) => {
    if (workspace.memberCount !== undefined && workspace.memberCount !== null) {
      return workspace.memberCount;
    }
    if (workspace.members && Array.isArray(workspace.members)) {
      return workspace.members.length;
    }
    if (workspace.members && typeof workspace.members === 'object') {
      return Object.keys(workspace.members).length;
    }
    return 1;
  };

  const getMembers = (workspace) => {
    if (workspace.members && Array.isArray(workspace.members)) {
      return workspace.members;
    }
    if (workspace.members && typeof workspace.members === 'object') {
      return Object.values(workspace.members);
    }
    if (workspace.owner) {
      return [workspace.owner];
    }
    return [];
  };

  const getOwnerName = (workspace) => {
    if (workspace.owner?.name) return workspace.owner.name;
    if (workspace.owner?.username) return workspace.owner.username;
    if (workspace.owner?.email) return workspace.owner.email;
    if (typeof workspace.owner === 'string') return workspace.owner;
    return 'Unknown';
  };

  return (
    <div 
      className="min-h-screen overflow-y-auto text-[#2B2B2F] overflow-x-hidden relative"
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

      {/* Navbar */}
      <nav className="relative mx-4 sm:mx-6 mt-4 sm:mt-6 transition-all duration-300">
  <div className="flex items-center justify-between px-6 py-3 rounded-[20px]" style={raised}>
    <div className="flex items-center gap-3">
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
    </div>

    <div className="flex items-center gap-3">
      <div className="relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center gap-3 px-3 py-1.5 transition-all duration-300 hover:scale-[1.02] active:scale-95 rounded-xl"
          style={raisedSm}
        >
          <div className="relative">
            <Avatar className="h-8 w-8 border-2 transition-all duration-300" style={{ borderColor: 'rgba(163,167,178,0.3)' }}>
              <AvatarImage src={getAvatarUrl()} alt={user?.name} />
              <AvatarFallback className="text-xs font-medium" style={{ color: '#2B2B2F' }}>
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-sm font-medium leading-tight" style={{ color: '#2B2B2F' }}>
              {user?.name}
            </span>
            <span className="text-[10px] flex items-center gap-1" style={{ color: '#6B9E6B' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#6B9E6B' }}></span>
              Online
            </span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} style={{ color: '#787B85' }} />
        </button>

        {showUserMenu && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowUserMenu(false)}
            ></div>
            <div className="absolute right-0 mt-2 w-56 rounded-[18px] overflow-hidden z-50 transition-all duration-300" style={raised}>
              <div className="p-3" style={{ borderBottom: '1px solid rgba(163,167,178,0.2)' }}>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2" style={{ borderColor: 'rgba(163,167,178,0.3)' }}>
                    <AvatarImage src={getAvatarUrl()} alt={user?.name} />
                    <AvatarFallback className="text-sm font-medium" style={{ color: '#2B2B2F' }}>
                      {getInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#2B2B2F' }}>{user?.name}</p>
                    <p className="text-xs truncate max-w-[140px]" style={{ color: '#787B85' }}>{user?.email}</p>
                  </div>
                </div>
              </div>
              <div className="p-1">
                <Link to="/profile" onClick={() => setShowUserMenu(false)}>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-xl transition-all duration-300"
                    style={{ color: '#4A4C53' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(193,101,47,0.08)';
                      e.currentTarget.style.color = '#C1652F';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#4A4C53';
                    }}
                  >
                    <User className="w-4 h-4" style={{ color: '#C1652F' }} />
                    Profile Settings
                  </button>
                </Link>
              </div>
              <div className="p-1" style={{ borderTop: '1px solid rgba(163,167,178,0.15)' }}>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    setShowLogoutDialog(true);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-xl transition-all duration-300"
                  style={{ color: '#B33C3C' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(179,60,60,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <LogOut className="w-4 h-4" style={{ color: '#B33C3C' }} />
                  Logout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  </div>
</nav>
       
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <PendingInvitations onAccepted={fetchWorkspaces} />
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#26262B' }}>
              Welcome back, <span style={{ color: '#C1652F' }}>{user?.name}</span>
            </h1>
            <p className="text-sm" style={{ color: '#787B85' }}>Manage your workspaces and collaborate with your team</p>
          </div>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="group font-bold transition-all duration-300 hover:scale-[1.02] active:scale-95"
            style={{
              background: "linear-gradient(160deg, #D07B47, #B0552A)",
              boxShadow:
                "6px 6px 14px rgba(163,167,178,0.5), -3px -3px 10px rgba(255,255,255,0.4), inset 0 1px 0 rgba(255,255,255,0.25)",
              borderRadius: "14px",
              color: "#FBF6F1",
              border: "1px solid rgba(255,255,255,0.15)",
              padding: "10px 20px"
            }}
          >
            <Plus className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
            New Workspace
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-4 transition-all duration-300 rounded-xl hover:scale-[1.02] active:scale-95" style={raisedSm}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={pressed}>
                <FolderPlus className="w-5 h-5" style={{ color: '#C1652F' }} />
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: '#2B2B2F' }}>{totalWorkspaces}</div>
                <div className="text-xs font-medium" style={{ color: '#787B85' }}>Total Workspaces</div>
              </div>
            </div>
          </div>
          <div className="p-4 transition-all duration-300 rounded-xl hover:scale-[1.02] active:scale-95" style={raisedSm}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={pressed}>
                <Users className="w-5 h-5" style={{ color: '#2C7A7A' }} />
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: '#2B2B2F' }}>{totalMembers}</div>
                <div className="text-xs font-medium" style={{ color: '#787B85' }}>Total Members</div>
              </div>
            </div>
          </div>
          <div className="p-4 transition-all duration-300 rounded-xl hover:scale-[1.02] active:scale-95" style={raisedSm}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={pressed}>
                <Sparkles className="w-5 h-5" style={{ color: '#C1652F' }} />
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: '#2B2B2F' }}>{ownerWorkspaces}</div>
                <div className="text-xs font-medium" style={{ color: '#787B85' }}>Owned Workspaces</div>
              </div>
            </div>
          </div>
        </div>

        {/* Workspace Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative w-14 h-14 rounded-full flex items-center justify-center" style={raisedSm}>
              <div className="w-8 h-8 border-4 border-[#C1652F] border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        ) : workspaces.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={raised}>
              <FolderPlus className="w-10 h-10" style={{ color: '#C1652F' }} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#4A4C53' }}>No workspaces yet</h3>
            <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: '#787B85' }}>
              Create your first workspace to start collaborating with your team.
            </p>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="group font-bold transition-all duration-300 hover:scale-[1.02] active:scale-95"
              style={{
                background: "linear-gradient(160deg, #D07B47, #B0552A)",
                boxShadow:
                  "6px 6px 14px rgba(163,167,178,0.5), -3px -3px 10px rgba(255,255,255,0.4), inset 0 1px 0 rgba(255,255,255,0.25)",
                borderRadius: "14px",
                color: "#FBF6F1",
                border: "1px solid rgba(255,255,255,0.15)",
                padding: "10px 20px"
              }}
            >
              <Plus className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
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
              const workspaceId = workspace.id || workspace._id;
              
              return (
                <div 
                  key={workspaceId}
                  className="relative rounded-[18px] overflow-hidden transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale-95"
                  style={raised}
                  onMouseEnter={() => setHoveredWorkspace(workspaceId)}
                  onMouseLeave={() => setHoveredWorkspace(null)}
                >
                  <div className="relative p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold truncate transition-all duration-300"
                          style={{
                            color: hoveredWorkspace === workspaceId ? '#C1652F' : '#2B2B2F'
                          }}
                        >
                          {workspace.name}
                        </h3>
                        {workspace.description && (
                          <p className="text-sm mt-1 line-clamp-2" style={{ color: '#787B85' }}>
                            {workspace.description}
                          </p>
                        )}
                      </div>
                      {isOwner && (
                        <button
                          onClick={() => handleDeleteWorkspace(workspaceId, workspace.name)}
                          disabled={deletingId === workspaceId}
                          className="p-1.5 rounded-lg transition-all duration-300 disabled:opacity-50 ml-2"
                          style={{ color: '#787B85' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(179,60,60,0.08)';
                            e.currentTarget.style.color = '#B33C3C';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#787B85';
                          }}
                        >
                          {deletingId === workspaceId ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-sm" style={{ color: '#787B85' }}>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" style={{ color: '#C1652F' }} />
                        <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" style={{ color: '#C1652F' }} />
                        <span>{new Date(workspace.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="mt-1 text-xs" style={{ color: '#787B85' }}>
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
                                className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-medium transition-all duration-300 hover:scale-110"
                                style={{
                                  background: 'linear-gradient(160deg, #F7F8FA 0%, #E7E9EC 100%)',
                                  borderColor: 'rgba(255,255,255,0.6)',
                                  color: '#4A4C53',
                                  boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.7), inset -1px -1px 2px rgba(0,0,0,0.05)'
                                }}
                                title={displayName}
                              >
                                {initial}
                              </div>
                            );
                          })
                        ) : (
                          <div
                            className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-medium transition-all duration-300 hover:scale-110"
                            style={{
                              background: 'linear-gradient(160deg, #F7F8FA 0%, #E7E9EC 100%)',
                              borderColor: 'rgba(255,255,255,0.6)',
                              color: '#4A4C53',
                              boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.7), inset -1px -1px 2px rgba(0,0,0,0.05)'
                            }}
                            title={ownerName}
                          >
                            {ownerName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {memberCount > 4 && (
                          <div className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs transition-all duration-300 hover:scale-110"
                            style={{
                              background: 'linear-gradient(160deg, #F7F8FA 0%, #E7E9EC 100%)',
                              borderColor: 'rgba(255,255,255,0.6)',
                              color: '#787B85',
                              boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.7), inset -1px -1px 2px rgba(0,0,0,0.05)'
                            }}
                          >
                            +{memberCount - 4}
                          </div>
                        )}
                      </div>

                      <Link to={`/workspace/${workspaceId}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-sm transition-all duration-300 group"
                          style={{ color: '#787B85' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#C1652F';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#787B85';
                          }}
                        >
                          Open
                          <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                        </Button>
                      </Link>
                    </div>

                    {/* Role Badge */}
                    <div className="absolute top-4 right-14">
                      <span 
                        className="text-[10px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1 transition-all duration-300 hover:scale-105"
                        style={{
                          color: role.color,
                          background: role.bg,
                          border: `1px solid ${role.border}`,
                          boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.3), inset -1px -1px 2px rgba(0,0,0,0.05)'
                        }}
                      >
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
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 animate-in fade-in duration-200"
            onClick={() => setShowLogoutDialog(false)}
          ></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="rounded-[20px] max-w-md w-full transition-all duration-300" style={raised}>
              <div className="flex items-start justify-between p-6" style={{ borderBottom: '1px solid rgba(163,167,178,0.2)' }}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl" style={pressed}>
                    <AlertTriangle className="w-5 h-5" style={{ color: '#C1652F' }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: '#2B2B2F' }}>Confirm Logout</h3>
                    <p className="text-sm" style={{ color: '#787B85' }}>Are you sure you want to sign out?</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLogoutDialog(false)}
                  className="p-1.5 rounded-lg transition-all duration-300"
                  style={{ color: '#787B85' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6">
                <div className="p-4 rounded-xl" style={pressed}>
                  <p className="text-sm" style={{ color: '#6B4A3A' }}>
                    You will be signed out of your account and redirected to the login page.
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#C1652F' }}></div>
                    <span className="text-xs" style={{ color: '#787B85' }}>Session will be terminated</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-4 p-3 rounded-xl" style={raisedSm}>
                  <Avatar className="h-8 w-8 border-2" style={{ borderColor: 'rgba(163,167,178,0.3)' }}>
                    <AvatarImage src={getAvatarUrl()} alt={user?.name} />
                    <AvatarFallback className="text-xs font-medium" style={{ color: '#2B2B2F' }}>
                      {getInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#2B2B2F' }}>{user?.name}</p>
                    <p className="text-xs" style={{ color: '#787B85' }}>{user?.email}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 p-6 rounded-b-[20px]" style={{ borderTop: '1px solid rgba(163,167,178,0.15)' }}>
                <Button
                  variant="ghost"
                  onClick={() => setShowLogoutDialog(false)}
                  className="flex-1 rounded-xl transition-all duration-300"
                  style={{ color: '#787B85' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
                    e.currentTarget.style.color = '#2B2B2F';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#787B85';
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleLogout}
                  className="flex-1 font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-95"
                  style={{
                    background: "linear-gradient(160deg, #D07B47, #B0552A)",
                    boxShadow:
                      "6px 6px 14px rgba(163,167,178,0.5), -3px -3px 10px rgba(255,255,255,0.4), inset 0 1px 0 rgba(255,255,255,0.25)",
                    color: "#FBF6F1",
                    border: "1px solid rgba(255,255,255,0.15)",
                    padding: "10px 20px"
                  }}
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