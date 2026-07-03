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
} from 'lucide-react';

const InviteUser = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', role: 'editor' });
  const [pending, setPending] = useState([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0d0d0d] to-[#0a0a0a] text-white relative overflow-hidden">
      <div className="absolute top-[-300px] right-[-200px] w-[600px] h-[600px] rounded-full bg-rose-500/10 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-300px] left-[-200px] w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-3xl animate-pulse delay-1000"></div>

      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M60 0 L0 0 0 60' fill='none' stroke='rgba(255,255,255,0.05)' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/workspace/${workspaceId}/members`)}
          className="mb-6 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Members
        </Button>

        {/* Invite Card */}
        <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-400/5 via-transparent to-cyan-400/5"></div>

          <div className="relative">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-gradient-to-br from-rose-500/20 to-cyan-500/20 rounded-lg border border-white/10">
                <UserPlus className="w-5 h-5 text-white/80" />
              </div>
              <h1 className="text-lg font-semibold text-white/90">Invite a Member</h1>
            </div>
            <p className="text-sm text-white/40 mb-6">
              Enter any email — since this is a demo environment, the invited user just needs to
              sign up or log in with that exact email to see the invitation.
            </p>

            {error && (
              <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-white/60 text-xs">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="testuser@gmail.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="bg-white/5 border-white/10 focus-visible:ring-rose-400/40 text-white placeholder:text-white/20 rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/60 text-xs">Role</Label>
                <Select value={form.role} onValueChange={(role) => setForm({ ...form, role })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141414] border-white/10 text-white">
                    <SelectItem value="editor">Editor — can edit files</SelectItem>
                    <SelectItem value="owner">Owner — full control</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-rose-500 to-rose-400 hover:from-rose-400 hover:to-rose-300 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-rose-500/25 transition-all duration-300 border border-white/20"
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {submitting ? 'Sending...' : 'Send Invitation'}
              </Button>
            </form>
          </div>
        </div>

        {/* Pending List */}
        <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-4 h-4 text-white/40" />
            <h2 className="text-sm font-medium text-white/70">Pending Invitations</h2>
          </div>

          {loadingPending ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-white/30" />
            </div>
          ) : pending.length === 0 ? (
            <p className="text-sm text-white/30 text-center py-6">No pending invitations.</p>
          ) : (
            <div className="space-y-3">
              {pending.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all duration-300"
                >
                  <div>
                    <p className="text-sm font-medium text-white/80">{inv.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10">
                        {inv.role === 'owner' ? 'Owner' : 'Editor'}
                      </span>
                      <span className="text-xs text-white/25">
                        Invited by {inv.invitedBy?.name}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCancel(inv.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-500/10 text-white/30 hover:text-rose-400 transition-all duration-300"
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
  );
};

export default InviteUser;