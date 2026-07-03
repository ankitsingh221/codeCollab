import { useState, useEffect } from 'react';
import { invitationApi } from '../api/invitationApi';
import { getId } from '../utils/getId';
import { Button } from '@/components/ui/button';
import { Mail, Check, X, Loader2 } from 'lucide-react';

const PendingInvitations = ({ onAccepted }) => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);

  const fetchInvitations = async () => {
    try {
      const response = await invitationApi.getMine();
      setInvitations(response.data.invitations || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleAccept = async (invitation) => {
    const id = getId(invitation);
    setActingId(id);
    try {
      await invitationApi.accept(id);
      setInvitations((prev) => prev.filter((i) => getId(i) !== id));
      onAccepted?.();
    } catch (error) {
      console.error('Error accepting invitation:', error);
    } finally {
      setActingId(null);
    }
  };

  const handleDecline = async (invitation) => {
    const id = getId(invitation);
    setActingId(id);
    try {
      await invitationApi.decline(id);
      setInvitations((prev) => prev.filter((i) => getId(i) !== id));
    } catch (error) {
      console.error('Error declining invitation:', error);
    } finally {
      setActingId(null);
    }
  };

  if (loading || invitations.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-cyan-500/10 rounded-lg">
          <Mail className="w-4 h-4 text-cyan-400" />
        </div>
        <h2 className="text-sm font-medium text-white/70">
          Pending Invitations <span className="text-white/30">({invitations.length})</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {invitations.map((inv) => {
          const invId = getId(inv);
          return (
            <div
              key={invId}
              className="group relative bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-4 overflow-hidden hover:border-cyan-400/40 transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative flex items-start gap-3">
                <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-rose-400/30 to-cyan-400/30 flex items-center justify-center text-xs font-medium text-white/80">
                  {inv.invitedBy?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-white/80 truncate">
                    <span className="font-semibold text-white">{inv.invitedBy?.name}</span> invited you to
                  </p>
                  <p className="text-sm font-medium bg-gradient-to-r from-rose-400 to-cyan-400 bg-clip-text text-transparent truncate">
                    {inv.workspaceId?.name}
                  </p>
                  <span className="inline-block mt-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10">
                    {inv.role === 'owner' ? 'Owner' : 'Editor'} access
                  </span>
                </div>
              </div>

              <div className="relative flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={actingId === invId}
                  onClick={() => handleDecline(inv)}
                  className="flex-1 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all duration-300"
                >
                  <X className="w-4 h-4 mr-1" />
                  Decline
                </Button>
                <Button
                  size="sm"
                  disabled={actingId === invId}
                  onClick={() => handleAccept(inv)}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black font-semibold rounded-xl transition-all duration-300"
                >
                  {actingId === invId ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Accept
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PendingInvitations;