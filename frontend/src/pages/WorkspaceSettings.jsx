import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workspaceApi } from '../api/workspaceApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '../context/ToastContext';
import {
  ArrowLeft,
  Settings,
  Loader2,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Key,
} from 'lucide-react';

const WorkspaceSettings = () => {
  const { workspaceId } = useParams();
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

  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const response = await workspaceApi.getWorkspaceById(workspaceId);
        const ws = response.data.workspace;
        setForm({ name: ws.name, description: ws.description || '' });
        setWorkspaceName(ws.name);
        toast({
          title: "Settings Loaded",
          description: `Settings for "${ws.name}" loaded`,
          variant: "success"
        });
      } catch (err) {
        console.error(err);
        const errorMsg = err.response?.data?.message || 'Failed to load workspace settings';
        setError(errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive"
        });
        if (err.response?.status === 403 || err.response?.status === 404) {
          navigate('/dashboard');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchWorkspace();
  }, [workspaceId]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const response = await workspaceApi.updateWorkspace(workspaceId, form);
      setWorkspaceName(response.data.workspace.name);
      setSuccess('Workspace updated successfully');
      
      toast({
        title: "Workspace Updated",
        description: `"${response.data.workspace.name}" has been updated successfully`,
        variant: "success"
      });
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update workspace';
      setError(errorMsg);
      toast({
        title: "Update Failed",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await workspaceApi.deleteWorkspace(workspaceId);
      
      toast({
        title: "Workspace Deleted",
        description: `"${workspaceName}" has been permanently deleted`,
        variant: "success"
      });
      
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete workspace';
      setError(errorMsg);
      toast({
        title: "Delete Failed",
        description: errorMsg,
        variant: "destructive"
      });
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#ECEDF0" }}>
        <div className="relative w-14 h-14 rounded-full flex items-center justify-center" style={raisedSm}>
          <div className="w-8 h-8 border-4 border-[#C1652F] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

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

        {/* General Settings */}
        <div className="relative rounded-[20px] p-6 mb-6 transition-all duration-300 hover:scale-[1.01]" style={raised}>
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={pressed}>
                <Settings className="w-5 h-5" style={{ color: '#C1652F' }} />
              </div>
              <h1 className="text-lg font-bold tracking-tight" style={{ color: '#26262B' }}>
                Workspace Settings
              </h1>
            </div>

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

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2" style={{ color: '#4A4C53' }}>
                  <Key className="w-3.5 h-3.5" style={{ color: '#C1652F' }} />
                  Workspace Name
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                      background: focusedField === 'name' 
                        ? "linear-gradient(160deg, #E3E5E9 0%, #F0F1F4 100%)"
                        : "linear-gradient(160deg, #F7F8FA 0%, #E7E9EC 100%)",
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-sm font-medium flex items-center gap-2" style={{ color: '#4A4C53' }}>
                  <AlertCircle className="w-3.5 h-3.5" style={{ color: '#C1652F' }} />
                  Description
                </Label>
                <div className="relative">
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    onFocus={() => setFocusedField('description')}
                    onBlur={() => setFocusedField(null)}
                    rows={3}
                    placeholder="Add a description for your workspace"
                    className="transition-all duration-300 resize-none"
                    style={{
                      ...(focusedField === 'description' ? pressed : raisedSm),
                      borderRadius: "12px",
                      border: focusedField === 'description' 
                        ? "2px solid #C1652F" 
                        : "1px solid rgba(255,255,255,0.5)",
                      color: '#2B2B2F',
                      padding: '12px 16px',
                      fontSize: '14px',
                      minHeight: '80px',
                      background: focusedField === 'description' 
                        ? "linear-gradient(160deg, #E3E5E9 0%, #F0F1F4 100%)"
                        : "linear-gradient(160deg, #F7F8FA 0%, #E7E9EC 100%)",
                    }}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={saving}
                className="w-full font-bold transition-all duration-300 hover:scale-[1.02] active:scale-95 group"
                style={{
                  background: "linear-gradient(160deg, #D07B47, #B0552A)",
                  boxShadow:
                    "6px 6px 14px rgba(163,167,178,0.5), -3px -3px 10px rgba(255,255,255,0.4), inset 0 1px 0 rgba(255,255,255,0.25)",
                  borderRadius: "14px",
                  color: "#FBF6F1",
                  border: "1px solid rgba(255,255,255,0.15)",
                  padding: '12px 20px',
                  fontSize: '15px'
                }}
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="relative rounded-[20px] p-6 overflow-hidden transition-all duration-300 hover:scale-[1.01]" 
          style={{
            ...raised,
            background: "linear-gradient(160deg, #F8F0F0 0%, #E8D8D8 100%)",
            border: "1px solid rgba(193,101,47,0.15)",
          }}
        >
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4" style={{ color: '#C1652F' }} />
              <h2 className="text-sm font-bold" style={{ color: '#C1652F' }}>Danger Zone</h2>
            </div>
            <p className="text-xs mb-4" style={{ color: '#787B85' }}>
              Deleting a workspace permanently removes all files, members, and pending invitations.
              This cannot be undone.
            </p>

            <div className="space-y-2 mb-4">
              <Label className="text-xs" style={{ color: '#787B85' }}>
                Type <span className="font-semibold" style={{ color: '#C1652F' }}>{workspaceName}</span> to confirm
              </Label>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={workspaceName}
                className="transition-all duration-300"
                style={{
                  background: "linear-gradient(160deg, #F7F8FA 0%, #E7E9EC 100%)",
                  boxShadow: "inset 3px 3px 7px rgba(163,167,178,0.3), inset -3px -3px 7px rgba(255,255,255,0.6)",
                  borderRadius: "12px",
                  border: "1px solid rgba(193,101,47,0.15)",
                  color: '#2B2B2F',
                  padding: '12px 16px',
                  fontSize: '14px'
                }}
              />
            </div>

            <Button
              onClick={handleDelete}
              disabled={confirmText !== workspaceName || deleting}
              className="w-full font-bold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95"
              style={{
                background: confirmText === workspaceName && !deleting
                  ? "linear-gradient(160deg, #D07B47, #B0552A)"
                  : "linear-gradient(160deg, #E8E0E0 0%, #D8D0D0 100%)",
                boxShadow: confirmText === workspaceName && !deleting
                  ? "6px 6px 14px rgba(163,167,178,0.5), -3px -3px 10px rgba(255,255,255,0.4), inset 0 1px 0 rgba(255,255,255,0.25)"
                  : "inset 2px 2px 4px rgba(163,167,178,0.2), inset -2px -2px 4px rgba(255,255,255,0.4)",
                borderRadius: "14px",
                color: confirmText === workspaceName && !deleting ? '#FBF6F1' : '#787B85',
                border: confirmText === workspaceName && !deleting
                  ? "1px solid rgba(255,255,255,0.15)"
                  : "1px solid rgba(163,167,178,0.2)",
                padding: '12px 20px',
                fontSize: '15px'
              }}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Workspace
                </>
              )}
            </Button>
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

export default WorkspaceSettings;