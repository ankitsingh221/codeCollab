import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { memberApi } from '../api/memberApi';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { ArrowLeft, UserPlus, Trash2, Loader2, Users } from 'lucide-react';

const MembersManagement = () => {
  const { workspaceId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const myMembership = members.find((m) => m.userId?.id === user?.id);
  const isOwner = myMembership?.role === 'owner';

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await memberApi.getAll(workspaceId);
      setMembers(response.data.members || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [workspaceId]);

  const handleRoleChange = async (memberId, role) => {
    setUpdatingId(memberId);
    try {
      await memberApi.updateRole(workspaceId, memberId, role);
      fetchMembers();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (memberId, name) => {
    if (!confirm(`Remove ${name} from this workspace?`)) return;
    setUpdatingId(memberId);
    try {
      await memberApi.remove(workspaceId, memberId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0d0d0d] to-[#0a0a0a] text-white relative overflow-hidden">
      <div className="absolute top-[-300px] right-[-200px] w-[600px] h-[600px] rounded-full bg-rose-500/10 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-300px] left-[-200px] w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-3xl animate-pulse delay-1000"></div>

      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M60 0 L0 0 0 60' fill='none' stroke='rgba(255,255,255,0.05)' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="mb-6 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Button>

        <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-400/5 via-transparent to-cyan-400/5"></div>

          <div className="relative flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-rose-500/20 to-cyan-500/20 rounded-lg border border-white/10">
                <Users className="w-5 h-5 text-white/80" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white/90">Members</h1>
                <p className="text-xs text-white/40">Manage who has access to this workspace</p>
              </div>
            </div>
            {isOwner && (
              <Link to={`/workspace/${workspaceId}/invite`}>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-rose-500 to-rose-400 hover:from-rose-400 hover:to-rose-300 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-rose-500/25 transition-all duration-300 border border-white/20"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite
                </Button>
              </Link>
            )}
          </div>

          <div className="relative">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-white/30" />
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((member) => {
                  const isSelf = member.userId?.id === user?.id;
                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-rose-400/30 to-cyan-400/30 flex items-center justify-center text-xs font-medium text-white/70">
                          {member.userId?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white/80 truncate">
                            {member.userId?.name}{' '}
                            {isSelf && <span className="text-white/30 font-normal">(You)</span>}
                          </p>
                          <p className="text-xs text-white/30 truncate">{member.userId?.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isOwner && !isSelf ? (
                          <Select
                            value={member.role}
                            onValueChange={(role) => handleRoleChange(member.id, role)}
                            disabled={updatingId === member.id}
                          >
                            <SelectTrigger className="w-28 h-8 text-xs bg-white/5 border-white/10 text-white rounded-lg">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#141414] border-white/10 text-white">
                              <SelectItem value="editor">Editor</SelectItem>
                              <SelectItem value="owner">Owner</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <span
                            className={`text-[10px] font-medium px-2 py-1 rounded-full border ${
                              member.role === 'owner'
                                ? 'bg-rose-500/20 text-rose-400 border-rose-500/20'
                                : 'bg-white/5 text-white/40 border-white/10'
                            }`}
                          >
                            {member.role === 'owner' ? 'Owner' : 'Editor'}
                          </span>
                        )}

                        {isOwner && !isSelf && (
                          <button
                            onClick={() => handleRemove(member.id, member.userId?.name)}
                            disabled={updatingId === member.id}
                            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-white/30 hover:text-rose-400 transition-all duration-300 disabled:opacity-50"
                          >
                            {updatingId === member.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembersManagement;