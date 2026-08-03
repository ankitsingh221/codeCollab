import { useState, useEffect, useRef } from "react";
import { workspaceApi } from "../api/workspaceApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Loader2, Sparkles, Plus, FolderPlus, AlertCircle } from "lucide-react";

const CreateWorkspaceModal = ({ isOpen, onClose, onWorkspaceCreated }) => {
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

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setDescription("");
      setError("");
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await workspaceApi.createWorkspace({
        name: name.trim(),
        description: description.trim(),
      });

      onWorkspaceCreated(response.data.workspace);
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create workspace");
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleOverlayClick}
    >
      <div className="relative w-full max-w-md rounded-[20px] transition-all duration-300 animate-in zoom-in-95 duration-200" style={raised}>
        {/* Decorative top line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-[20px]"
          style={{
            background: 'linear-gradient(90deg, #C1652F, #D07B47, #C1652F)',
            opacity: 0.6
          }}
        ></div>

        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 z-10"
          style={raisedSm}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#C1652F';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#787B85';
          }}
        >
          <X className="w-5 h-5" style={{ color: '#787B85' }} />
        </button>

        <div className="relative p-6">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-3 rounded-full" style={pressed}>
              <Sparkles className="w-3 h-3" style={{ color: '#C1652F' }} />
              <span className="text-[11px] tracking-[0.15em] uppercase font-bold" style={{ color: '#6B6D75' }}>
                New Workspace
              </span>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#C1652F' }} />
            </div>
            <h2 className="text-2xl font-bold tracking-tight" style={{ color: '#26262B' }}>
              Create Workspace
            </h2>
            <p className="text-sm mt-1" style={{ color: '#787B85' }}>
              Create a new workspace to start collaborating with your team
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2" style={{ color: '#4A4C53' }}>
                <FolderPlus className="w-3.5 h-3.5" style={{ color: '#C1652F' }} />
                Workspace Name <span style={{ color: '#C1652F' }}>*</span>
              </Label>
              <div className="relative">
                <Input
                  ref={inputRef}
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter workspace name"
                  required
                  maxLength={50}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  className="transition-all duration-300"
                  style={{
                    ...(focusedField === 'name' ? pressed : raisedSm),
                    borderRadius: '12px',
                    border: focusedField === 'name' 
                      ? '2px solid #C1652F' 
                      : '1px solid rgba(255,255,255,0.5)',
                    color: '#2B2B2F',
                    padding: '12px 16px',
                    fontSize: '14px',
                    background: focusedField === 'name' 
                      ? "linear-gradient(160deg, #E3E5E9 0%, #F0F1F4 100%)"
                      : "linear-gradient(160deg, #F7F8FA 0%, #E7E9EC 100%)",
                  }}
                />
              </div>
              <div className="text-right text-xs" style={{ color: '#787B85' }}>
                {name.length}/50
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-sm font-medium flex items-center gap-2" style={{ color: '#4A4C53' }}>
                <AlertCircle className="w-3.5 h-3.5" style={{ color: '#C1652F' }} />
                Description <span className="text-xs" style={{ color: '#787B85' }}>(optional)</span>
              </Label>
              <div className="relative">
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's this workspace about?"
                  maxLength={200}
                  rows={3}
                  onFocus={() => setFocusedField('description')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full transition-all duration-300 resize-none outline-none"
                  style={{
                    ...(focusedField === 'description' ? pressed : raisedSm),
                    borderRadius: '12px',
                    border: focusedField === 'description' 
                      ? '2px solid #C1652F' 
                      : '1px solid rgba(255,255,255,0.5)',
                    color: '#2B2B2F',
                    padding: '12px 16px',
                    fontSize: '14px',
                    minHeight: '80px',
                    fontFamily: 'inherit',
                    background: focusedField === 'description' 
                      ? "linear-gradient(160deg, #E3E5E9 0%, #F0F1F4 100%)"
                      : "linear-gradient(160deg, #F7F8FA 0%, #E7E9EC 100%)",
                  }}
                />
              </div>
              <div className="text-right text-xs" style={{ color: '#787B85' }}>
                {description.length}/200
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm animate-in slide-in-from-top-2 duration-200" style={pressed}>
                <AlertCircle className="w-4 h-4 shrink-0" style={{ color: '#C1652F' }} />
                <span style={{ color: '#6B4A3A' }}>{error}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-6" style={{ borderTop: '1px solid rgba(163,167,178,0.2)' }}>
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="sm:flex-1 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-95"
                style={{
                  ...raisedSm,
                  color: '#787B85',
                  border: '1px solid rgba(255,255,255,0.5)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#2B2B2F';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#787B85';
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !name.trim()}
                className="sm:flex-[1.5] font-bold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 group"
                style={{
                  background: loading || !name.trim()
                    ? 'linear-gradient(160deg, #E8ECF4 0%, #D5D9E0 100%)'
                    : "linear-gradient(160deg, #D07B47, #B0552A)",
                  boxShadow: loading || !name.trim()
                    ? '2px 2px 4px rgba(163,167,178,0.3), -2px -2px 4px rgba(255,255,255,0.5)'
                    : "4px 4px 10px rgba(163,167,178,0.4), -2px -2px 6px rgba(255,255,255,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
                  borderRadius: '14px',
                  color: loading || !name.trim() ? '#787B85' : '#FBF6F1',
                  border: loading || !name.trim()
                    ? '1px solid rgba(163,167,178,0.2)'
                    : '1px solid rgba(255,255,255,0.15)',
                  padding: '12px 20px',
                  fontSize: '15px'
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2 inline transition-transform duration-300 group-hover:rotate-90" />
                    Create Workspace
                  </>
                )}
              </Button>
            </div>
          </form>
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

export default CreateWorkspaceModal;