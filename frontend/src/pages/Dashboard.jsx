import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { workspaceApi } from '../api/workspaceApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
} from 'lucide-react';
import CreateWorkspaceModal from '../components/CreateWorkspaceModal';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    setLoading(true);
    try {
      const response = await workspaceApi.getWorkspaces();
      setWorkspaces(response.data.workspaces || []);
    } catch (error) {
      console.error('Error fetching workspaces:', error);
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
      setWorkspaces(workspaces.filter(w => w.id !== id));
    } catch (error) {
      console.error('Error deleting workspace:', error);
      alert(error.response?.data?.message || 'Failed to delete workspace. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleWorkspaceCreated = (newWorkspace) => {
    setWorkspaces([newWorkspace, ...workspaces]);
    setShowCreateModal(false);
  };

  // Calculate stats
  const totalWorkspaces = workspaces.length;
  const totalMembers = workspaces.reduce((acc, w) => acc + (w.memberCount || 0), 0);
  const ownerWorkspaces = workspaces.filter(w => w.isOwner).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0d0d0d] to-[#0a0a0a] text-white relative overflow-hidden">
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

      {/* Navbar */}
      <nav className="relative z-10 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-cyan-400 rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                  <div className="relative bg-black/50 p-2 rounded-lg border border-white/10">
                    <Code2 className="text-white" size={20} />
                  </div>
                </div>
                <span className="text-lg font-light tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                  Code<span className="font-bold bg-gradient-to-r from-rose-400 to-cyan-400 bg-clip-text text-transparent">Collab</span>
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/profile">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300"
                >
                  <User className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">{user?.name}</span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-white/40 hover:text-rose-400 hover:bg-white/5 rounded-xl transition-all duration-300"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8">
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
            className="bg-gradient-to-r from-rose-500 to-rose-400 hover:from-rose-400 hover:to-rose-300 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-rose-500/25 transition-all duration-300 border border-white/20"
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
            {workspaces.map((workspace) => (
              <Card 
                key={workspace.id}
                className="group relative bg-white/5 backdrop-blur-xl border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden rounded-2xl hover:-translate-y-2 hover:shadow-2xl hover:shadow-rose-500/10"
              >
                {/* Glass shine effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Gradient border glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-rose-400/0 via-cyan-400/0 to-rose-400/0 group-hover:from-rose-400/5 group-hover:via-cyan-400/5 group-hover:to-rose-400/5 transition-all duration-500"></div>
                
                <CardHeader className="relative pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold text-white/90 truncate">
                        {workspace.name}
                      </CardTitle>
                      {workspace.description && (
                        <CardDescription className="text-white/40 text-sm mt-1 line-clamp-2">
                          {workspace.description}
                        </CardDescription>
                      )}
                    </div>
                    {workspace.isOwner && (
                      <button
                        onClick={() => handleDeleteWorkspace(workspace.id, workspace.name)}
                        disabled={deletingId === workspace.id}
                        className="p-1.5 rounded-lg hover:bg-rose-500/10 text-white/30 hover:text-rose-400 transition-all duration-300 opacity-0 group-hover:opacity-100 disabled:opacity-50"
                      >
                        {deletingId === workspace.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="relative pt-2">
                  <div className="flex items-center gap-4 text-sm text-white/30">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      <span>{workspace.memberCount || 0} members</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(workspace.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {workspace.members?.slice(0, 4).map((member, index) => (
                        <div
                          key={index}
                          className="w-7 h-7 rounded-full border-2 border-[#0a0a0a] bg-gradient-to-br from-rose-400/30 to-cyan-400/30 flex items-center justify-center text-xs font-medium text-white/60"
                          title={member.name}
                        >
                          {member.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      ))}
                      {(workspace.memberCount || 0) > 4 && (
                        <div className="w-7 h-7 rounded-full border-2 border-[#0a0a0a] bg-white/5 flex items-center justify-center text-xs text-white/40">
                          +{(workspace.memberCount || 0) - 4}
                        </div>
                      )}
                    </div>

                    <Link to={`/workspace/${workspace.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white/40 hover:text-rose-400 hover:bg-white/5 transition-all duration-300 group-hover:gap-2"
                      >
                        Open
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                      </Button>
                    </Link>
                  </div>

                  {workspace.isOwner && (
                    <div className="absolute top-3 right-3">
                      <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/20">
                        Owner
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onWorkspaceCreated={handleWorkspaceCreated}
      />

      {/* Footer */}
      <footer className="relative max-w-7xl mx-auto px-4 sm:px-6 py-4 border-t border-white/5 mt-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/30">
            © 2026 CodeCollab. Built with <span className="text-rose-400">❤</span> for developers.
          </p>
          <div className="flex gap-6 text-xs">
            <a href="#" className="text-white/30 hover:text-rose-400 transition-colors duration-300">Privacy</a>
            <a href="#" className="text-white/30 hover:text-rose-400 transition-colors duration-300">Terms</a>
            <a href="#" className="text-white/30 hover:text-rose-400 transition-colors duration-300">Support</a>
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

export default Dashboard;