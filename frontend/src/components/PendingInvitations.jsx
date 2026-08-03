import { useState, useEffect } from 'react';
import { invitationApi } from '../api/invitationApi';
import { getId } from '../utils/getId';
import { connectSocket } from '../socket/socket';
import { useToast } from '../context/ToastContext';
import { Button } from '@/components/ui/button';
import { Mail, Check, X, Loader2 } from 'lucide-react';

const PendingInvitations = ({ onAccepted }) => {
  // Design tokens matching Landing page
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

  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const { toast } = useToast();

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

    const socket = connectSocket();

    const handleReceived = ({ invitation }) => {
      if (!invitation) return;
      setInvitations((prev) => {
        const id = getId(invitation);
        if (prev.some((i) => getId(i) === id)) return prev;
        return [invitation, ...prev];
      });
      toast({
        title: "Workspace Invitation Received",
        description: `${invitation.invitedBy?.name || "Someone"} invited you to join ${invitation.workspaceId?.name || "a workspace"}`,
        variant: "info",
      });
    };

    const handleCancelled = ({ invitationId }) => {
      setInvitations((prev) => prev.filter((i) => getId(i) !== invitationId));
    };

    const handleResolved = ({ invitationId }) => {
      setInvitations((prev) => prev.filter((i) => getId(i) !== invitationId));
    };

    socket.on("invitation:received", handleReceived);
    socket.on("invitation:cancelled", handleCancelled);
    socket.on("invitation:resolved", handleResolved);

    return () => {
      socket.off("invitation:received", handleReceived);
      socket.off("invitation:cancelled", handleCancelled);
      socket.off("invitation:resolved", handleResolved);
    };
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
        <div className="p-1.5 rounded-lg" style={pressed}>
          <Mail className="w-4 h-4" style={{ color: '#C1652F' }} />
        </div>
        <h2 className="text-sm font-medium" style={{ color: '#4A4C53' }}>
          Pending Invitations <span style={{ color: '#787B85' }}>({invitations.length})</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {invitations.map((inv) => {
          const invId = getId(inv);
          return (
            <div
              key={invId}
              className="relative rounded-[16px] p-4 overflow-hidden transition-all duration-300 hover:scale-[1.01]"
              style={raisedSm}
            >
              <div className="relative flex items-start gap-3">
                <div className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-xs font-medium"
                  style={{
                    ...pressed,
                    color: '#2B2B2F'
                  }}
                >
                  {inv.invitedBy?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm truncate" style={{ color: '#787B85' }}>
                    <span className="font-semibold" style={{ color: '#2B2B2F' }}>{inv.invitedBy?.name}</span> invited you to
                  </p>
                  <p className="text-sm font-medium truncate" style={{ color: '#C1652F' }}>
                    {inv.workspaceId?.name}
                  </p>
                  <span className="inline-block mt-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{
                      ...pressed,
                      color: '#787B85'
                    }}
                  >
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
                  className="flex-1 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-95"
                  style={{
                    ...raisedSm,
                    color: '#787B85'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#C1652F';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#787B85';
                  }}
                >
                  <X className="w-4 h-4 mr-1" />
                  Decline
                </Button>
                <Button
                  size="sm"
                  disabled={actingId === invId}
                  onClick={() => handleAccept(inv)}
                  className="flex-1 font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-95"
                  style={{
                    background: "linear-gradient(160deg, #D07B47, #B0552A)",
                    boxShadow:
                      "4px 4px 10px rgba(163,167,178,0.4), -2px -2px 6px rgba(255,255,255,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
                    color: '#FBF6F1',
                    border: '1px solid rgba(255,255,255,0.15)'
                  }}
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