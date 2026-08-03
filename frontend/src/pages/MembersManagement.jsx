import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { memberApi } from '../api/memberApi';
import { getId } from '../utils/getId';
import { useToast } from '../context/ToastContext';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { ArrowLeft, UserPlus, Trash2,  Users, Crown, UserCog } from 'lucide-react';

const MembersManagement = () => {
  const { workspaceId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
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

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const myMembership = members.find((m) => getId(m.userId) === getId(user));
  const isOwner = myMembership?.role === 'owner';

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await memberApi.getAll(workspaceId);
      setMembers(response.data.members || []);
      
      toast({
        title: "Members Loaded",
        description: `${response.data.members?.length || 0} members in workspace`,
        variant: "success"
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to load members",
        variant: "destructive"
      });
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
      await fetchMembers();
      
      const member = members.find(m => getId(m) === memberId);
      toast({
        title: "Role Updated",
        description: `${member?.userId?.name || 'Member'} is now ${role === 'owner' ? 'Owner' : 'Editor'}`,
        variant: "success"
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Update Failed",
        description: err.response?.data?.message || "Failed to update role",
        variant: "destructive"
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (memberId, name) => {
    if (!confirm(`Remove ${name} from this workspace?`)) return;
    
    setUpdatingId(memberId);
    try {
      await memberApi.remove(workspaceId, memberId);
      setMembers((prev) => prev.filter((m) => getId(m) !== memberId));
      
      toast({
        title: "Member Removed",
        description: `${name} has been removed from the workspace`,
        variant: "success"
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Remove Failed",
        description: err.response?.data?.message || "Failed to remove member",
        variant: "destructive"
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
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

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/workspace/${workspaceId}`)}
          className="mb-6 transition-all duration-300 hover:scale-[1.02] active:scale-95 group"
          style={{
            ...raisedSm,
            borderRadius: '12px',
            color: '#787B85',
            padding: '8px 16px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#C1652F';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#787B85';
          }}
        >
          <ArrowLeft className="w-4 h-4 mr-1 transition-transform duration-300 group-hover:-translate-x-1" />
          Back to Workspace
        </Button>

        <div className="relative rounded-[20px] p-6 transition-all duration-300 hover:scale-[1.01]" style={raised}>
          <div className="relative flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={pressed}>
                <Users className="w-5 h-5" style={{ color: '#C1652F' }} />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight" style={{ color: '#26262B' }}>
                  Members
                </h1>
                <p className="text-xs" style={{ color: '#787B85' }}>
                  {members.length} {members.length === 1 ? 'member' : 'members'} in this workspace
                </p>
              </div>
            </div>
            {isOwner && (
              <Link to={`/workspace/${workspaceId}/invite`}>
                <Button
                  size="sm"
                  className="font-bold transition-all duration-300 hover:scale-[1.02] active:scale-95 group"
                  style={{
                    background: "linear-gradient(160deg, #D07B47, #B0552A)",
                    boxShadow:
                      "4px 4px 10px rgba(163,167,178,0.4), -2px -2px 6px rgba(255,255,255,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
                    borderRadius: '12px',
                    color: '#FBF6F1',
                    border: '1px solid rgba(255,255,255,0.15)',
                    padding: '8px 16px',
                    fontSize: '13px'
                  }}
                >
                  <UserPlus className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                  Invite
                </Button>
              </Link>
            )}
          </div>

          <div className="relative">
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="relative w-12 h-12 rounded-full flex items-center justify-center" style={raisedSm}>
                  <div className="w-6 h-6 border-3 border-[#C1652F] border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm" style={{ color: '#787B85' }}>No members in this workspace yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((member) => {
                  const memberId = getId(member);
                  const isSelf = getId(member.userId) === getId(user);
                  return (
                    <div
                      key={memberId}
                      className="flex items-center justify-between p-3 rounded-xl transition-all duration-300 hover:scale-[1.01]"
                      style={raisedSm}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-all duration-300 hover:scale-110"
                          style={{
                            background: 'linear-gradient(160deg, #F7F8FA 0%, #E7E9EC 100%)',
                            borderColor: 'rgba(255,255,255,0.6)',
                            color: '#4A4C53',
                            boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.7), inset -1px -1px 2px rgba(0,0,0,0.05)'
                          }}
                        >
                          {member.userId?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: '#2B2B2F' }}>
                            {member.userId?.name}{' '}
                            {isSelf && <span className="font-normal" style={{ color: '#787B85' }}>(You)</span>}
                            {member.role === 'owner' && (
                              <Crown className="w-3.5 h-3.5 inline ml-1" style={{ color: '#C1652F' }} />
                            )}
                          </p>
                          <p className="text-xs truncate" style={{ color: '#787B85' }}>{member.userId?.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isOwner && !isSelf ? (
                          <Select
                            value={member.role}
                            onValueChange={(role) => handleRoleChange(memberId, role)}
                            disabled={updatingId === memberId}
                          >
                            <SelectTrigger className="w-28 h-8 text-xs rounded-lg transition-all duration-300"
                              style={{
                                ...raisedSm,
                                borderRadius: '10px',
                                border: '1px solid rgba(255,255,255,0.5)',
                                color: '#2B2B2F',
                                background: "linear-gradient(160deg, #F7F8FA 0%, #E7E9EC 100%)",
                              }}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl"
                              style={{
                                ...raised,
                                borderRadius: '12px',
                              }}
                            >
                              <SelectItem value="editor" className="hover:bg-[rgba(193,101,47,0.08)] rounded-lg">
                                <span className="flex items-center gap-1">
                                  <UserCog className="w-3 h-3" style={{ color: '#2C7A7A' }} />
                                  Editor
                                </span>
                              </SelectItem>
                              <SelectItem value="owner" className="hover:bg-[rgba(193,101,47,0.08)] rounded-lg">
                                <span className="flex items-center gap-1">
                                  <Crown className="w-3 h-3" style={{ color: '#C1652F' }} />
                                  Owner
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <span
                            className="text-[10px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1"
                            style={{
                              background: member.role === 'owner'
                                ? 'rgba(193,101,47,0.15)'
                                : 'rgba(44,122,122,0.12)',
                              color: member.role === 'owner' ? '#C1652F' : '#2C7A7A',
                              border: member.role === 'owner'
                                ? '1px solid rgba(193,101,47,0.2)'
                                : '1px solid rgba(44,122,122,0.15)',
                              boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.3), inset -1px -1px 2px rgba(0,0,0,0.05)'
                            }}
                          >
                            {member.role === 'owner' ? <Crown className="w-3 h-3" /> : <UserCog className="w-3 h-3" />}
                            {member.role === 'owner' ? 'Owner' : 'Editor'}
                          </span>
                        )}

                        {isOwner && !isSelf && (
                          <button
                            onClick={() => handleRemove(memberId, member.userId?.name)}
                            disabled={updatingId === memberId}
                            className="p-1.5 rounded-lg transition-all duration-300 disabled:opacity-50"
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
                            {updatingId === memberId ? (
                              <div className="w-4 h-4 border-2 border-[#C1652F] border-t-transparent rounded-full animate-spin"></div>
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