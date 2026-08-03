import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invitationApi } from '../api/invitationApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  ArrowLeft,
  UserPlus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Mail,
  Users,
  Crown,
  UserCog,
} from 'lucide-react';

import { connectSocket } from '../socket/socket';

const InviteUser = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

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

  const [form, setForm] = useState({ email: '', role: 'editor' });
  const [pending, setPending] = useState([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  const fetchPending = async () => {
    try {
      const response = await invitationApi.getForWorkspace(workspaceId);
      setPending(response.data.invitations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPending(false);
    }
  };

  useEffect(() => {
    fetchPending();

    const socket = connectSocket();

    const handleRefresh = () => fetchPending();

    socket.on("invitation:created", handleRefresh);
    socket.on("invitation:accepted", handleRefresh);
    socket.on("invitation:declined", handleRefresh);
    socket.on("invitation:cancelled", handleRefresh);

    return () => {
      socket.off("invitation:created", handleRefresh);
      socket.off("invitation:accepted", handleRefresh);
      socket.off("invitation:declined", handleRefresh);
      socket.off("invitation:cancelled", handleRefresh);
    };
  }, [workspaceId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await invitationApi.create(workspaceId, form);
      setSuccess(`Invitation sent to ${form.email}`);
      setForm({ email: '', role: 'editor' });
      fetchPending();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (invitationId) => {
    try {
      await invitationApi.cancel(workspaceId, invitationId);
      setPending((prev) => prev.filter((i) => i.id !== invitationId));
    } catch (err) {
      console.error(err);
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

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/workspace/${workspaceId}/members`)}
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
          Back to Members
        </Button>

        {/* Invite Card */}
        <div className="relative rounded-[20px] p-6 mb-6 transition-all duration-300 hover:scale-[1.01]" style={raised}>
          <div className="relative">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-lg" style={pressed}>
                <UserPlus className="w-5 h-5" style={{ color: '#C1652F' }} />
              </div>
              <h1 className="text-lg font-bold tracking-tight" style={{ color: '#26262B' }}>
                Invite a Member
              </h1>
            </div>
            <p className="text-sm mb-6" style={{ color: '#787B85' }}>
              Enter any email — since this is a demo environment, the invited user just needs to
              sign up or log in with that exact email to see the invitation.
            </p>

            {error && (
              <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-xl text-sm animate-in slide-in-from-top-2 duration-200" style={pressed}>
                <AlertCircle className="w-4 h-4 shrink-0" style={{ color: '#C1652F' }} />
                <span style={{ color: '#6B4A3A' }}>{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-xl text-sm animate-in slide-in-from-top-2 duration-200" style={pressed}>
                <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#6B9E6B' }} />
                <span style={{ color: '#3A6B3A' }}>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2" style={{ color: '#4A4C53' }}>
                  <Mail className="w-3.5 h-3.5" style={{ color: '#C1652F' }} />
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="testuser@gmail.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="transition-all duration-300"
                    style={{
                      ...(focusedField === 'email' ? pressed : raisedSm),
                      borderRadius: "12px",
                      border: focusedField === 'email' 
                        ? "2px solid #C1652F" 
                        : "1px solid rgba(255,255,255,0.5)",
                      color: '#2B2B2F',
                      padding: '12px 16px',
                      fontSize: '14px',
                      height: '42px',
                      background: focusedField === 'email' 
                        ? "linear-gradient(160deg, #E3E5E9 0%, #F0F1F4 100%)"
                        : "linear-gradient(160deg, #F7F8FA 0%, #E7E9EC 100%)",
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium flex items-center gap-2" style={{ color: '#4A4C53' }}>
                  <Users className="w-3.5 h-3.5" style={{ color: '#C1652F' }} />
                  Role
                </Label>
                <Select value={form.role} onValueChange={(role) => setForm({ ...form, role })}>
                  <SelectTrigger className="transition-all duration-300"
                    style={{
                      ...raisedSm,
                      borderRadius: "12px",
                      border: "1px solid rgba(255,255,255,0.5)",
                      color: '#2B2B2F',
                      padding: '12px 16px',
                      height: '42px',
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
                      <span className="flex items-center gap-2">
                        <UserCog className="w-4 h-4" style={{ color: '#2C7A7A' }} />
                        Editor — can edit files
                      </span>
                    </SelectItem>
                    <SelectItem value="owner" className="hover:bg-[rgba(193,101,47,0.08)] rounded-lg">
                      <span className="flex items-center gap-2">
                        <Crown className="w-4 h-4" style={{ color: '#C1652F' }} />
                        Owner — full control
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                disabled={submitting}
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
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {submitting ? 'Sending...' : 'Send Invitation'}
              </Button>
            </form>
          </div>
        </div>

        {/* Pending List */}
        <div className="relative rounded-[20px] p-6 transition-all duration-300 hover:scale-[1.01]" style={raised}>
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-4 h-4" style={{ color: '#C1652F' }} />
              <h2 className="text-sm font-medium" style={{ color: '#4A4C53' }}>Pending Invitations</h2>
            </div>

            {loadingPending ? (
              <div className="flex justify-center py-8">
                <div className="relative w-12 h-12 rounded-full flex items-center justify-center" style={raisedSm}>
                  <div className="w-5 h-5 border-3 border-[#C1652F] border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
            ) : pending.length === 0 ? (
              <p className="text-sm text-center py-6" style={{ color: '#787B85' }}>No pending invitations.</p>
            ) : (
              <div className="space-y-3">
                {pending.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between p-3 rounded-xl transition-all duration-300 hover:scale-[1.01]"
                    style={raisedSm}
                  >
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#2B2B2F' }}>{inv.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1"
                          style={{
                            background: inv.role === 'owner' 
                              ? 'rgba(193,101,47,0.15)' 
                              : 'rgba(44,122,122,0.12)',
                            color: inv.role === 'owner' ? '#C1652F' : '#2C7A7A',
                            border: inv.role === 'owner'
                              ? '1px solid rgba(193,101,47,0.2)'
                              : '1px solid rgba(44,122,122,0.15)',
                            boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.3), inset -1px -1px 2px rgba(0,0,0,0.05)'
                          }}
                        >
                          {inv.role === 'owner' ? <Crown className="w-3 h-3" /> : <UserCog className="w-3 h-3" />}
                          {inv.role === 'owner' ? 'Owner' : 'Editor'}
                        </span>
                        <span className="text-xs" style={{ color: '#787B85' }}>
                          Invited by {inv.invitedBy?.name}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCancel(inv.id)}
                      className="p-1.5 rounded-lg transition-all duration-300"
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
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-in-from-top-2 {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .slide-in-from-top-2 {
          animation: slide-in-from-top-2 0.2s ease-out;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default InviteUser;