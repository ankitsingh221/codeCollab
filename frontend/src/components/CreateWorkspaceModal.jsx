import { useState, useEffect, useRef } from "react";
import { workspaceApi } from "../api/workspaceApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Loader2, Sparkles, Plus } from "lucide-react";

const CreateWorkspaceModal = ({ isOpen, onClose, onWorkspaceCreated }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleOverlayClick}
    >
      <div className="relative w-full max-w-md bg-gradient-to-br from-[#0a0a0a] via-[#0d0d0d] to-[#0a0a0a] rounded-2xl border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Decorative gradient line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-rose-400/50 via-cyan-400/50 to-rose-400/50"></div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/30 hover:text-white/60 hover:bg-white/5 p-1.5 rounded-lg transition-all duration-300"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-xs text-white/60 tracking-wider uppercase mb-3">
              <Sparkles className="w-3 h-3 text-rose-400" />
              <span className="bg-gradient-to-r from-rose-400 to-cyan-400 bg-clip-text text-transparent font-semibold">
                New Workspace
              </span>
            </div>
            <h2 className="text-2xl font-light text-white">Create Workspace</h2>
            <p className="text-sm text-white/40 mt-1">
              Create a new workspace to start collaborating with your team
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="name"
                className="text-white/60 text-sm font-medium"
              >
                Workspace Name <span className="text-rose-400">*</span>
              </Label>
              <Input
                ref={inputRef}
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter workspace name"
                required
                maxLength={50}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-rose-400/50 focus:ring-rose-400/20 rounded-xl transition-all duration-300"
              />
              <div className="text-right text-xs text-white/20">
                {name.length}/50
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="description"
                className="text-white/60 text-sm font-medium"
              >
                Description{" "}
                <span className="text-white/20 text-xs">(optional)</span>
              </Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this workspace about?"
                maxLength={200}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-rose-400/50 focus:ring-rose-400/20 transition-all duration-300 resize-none outline-none"
              />
              <div className="text-right text-xs text-white/20">
                {description.length}/200
              </div>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-2 rounded-xl animate-in slide-in-from-top-2 duration-200">
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/5">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="sm:flex-1 bg-white/5 hover:bg-white/10 backdrop-blur-sm text-white/40 hover:text-white rounded-xl transition-all duration-300 border border-white/5 hover:border-white/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !name.trim()}
                className="sm:flex-[1.5] relative overflow-hidden bg-gradient-to-r from-rose-500 to-rose-400 hover:from-rose-400 hover:to-rose-300 text-white font-semibold rounded-xl transition-all duration-300 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed py-2.5 group"
              >
                {/* Shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2 inline group-hover:rotate-90 transition-transform duration-300" />
                    Create Workspace
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateWorkspaceModal;
