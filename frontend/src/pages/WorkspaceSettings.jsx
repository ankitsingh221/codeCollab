import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workspaceApi } from '../api/workspaceApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Settings,
  Loader2,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Trash2,
} from 'lucide-react';

const WorkspaceSettings = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const response = await workspaceApi.getWorkspaceById(workspaceId);
        const ws = response.data.workspace;
        setForm({ name: ws.name, description: ws.description || '' });
        setWorkspaceName(ws.name);
      } catch (err) {
        console.error(err);
        setError('Failed to load workspace settings');
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
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update workspace');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await workspaceApi.deleteWorkspace(workspaceId);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete workspace');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0d0d0d] to-[#0a0a0a] text-white relative overflow-hidden">
      <div className="absolute top-[-300px] right-[-200px] w-[600px] h-[600px] rounded-full bg-rose-500/10 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-300px] left-[-200px] w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-3xl animate-pulse delay-1000"></div>

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/workspace/${workspaceId}`)}
          className="mb-6 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Workspace
        </Button>

        {/* General Settings */}
        <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-400/5 via-transparent to-cyan-400/5"></div>

          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-rose-500/20 to-cyan-500/20 rounded-lg border border-white/10">
                <Settings className="w-5 h-5 text-white/80" />
              </div>
              <h1 className="text-lg font-semibold text-white/90">Workspace Settings</h1>
            </div>

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

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-white/60 text-xs">Workspace Name</Label>
                <Input
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="bg-white/5 border-white/10 focus-visible:ring-rose-400/40 text-white rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-white/60 text-xs">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="bg-white/5 border-white/10 focus-visible:ring-rose-400/40 text-white rounded-xl resize-none"
                />
              </div>
              <Button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-rose-500 to-rose-400 hover:from-rose-400 hover:to-rose-300 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-rose-500/25 transition-all duration-300 border border-white/20"
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="relative bg-rose-500/5 backdrop-blur-xl border border-rose-500/20 rounded-2xl p-6 overflow-hidden">
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <h2 className="text-sm font-semibold text-rose-400">Danger Zone</h2>
            </div>
            <p className="text-xs text-white/40 mb-4">
              Deleting a workspace permanently removes all files, members, and pending invitations.
              This cannot be undone.
            </p>

            <div className="space-y-2 mb-4">
              <Label className="text-white/50 text-xs">
                Type <span className="font-semibold text-white/70">{workspaceName}</span> to confirm
              </Label>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={workspaceName}
                className="bg-white/5 border-rose-500/20 focus-visible:ring-rose-400/40 text-white rounded-xl"
              />
            </div>

            <Button
              onClick={handleDelete}
              disabled={confirmText !== workspaceName || deleting}
              className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
            >
              {deleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              {deleting ? 'Deleting...' : 'Delete Workspace'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceSettings;