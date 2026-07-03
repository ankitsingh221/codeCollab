import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fileApi } from "../api/fileApi";
import { Plus, Loader2, X, FilePlus2 } from "lucide-react";

const QUICK_TEMPLATES = [
  { label: "HTML", ext: "html" },
  { label: "CSS", ext: "css" },
  { label: "JS", ext: "js" },
  { label: "Python", ext: "py" },
  { label: "C++", ext: "cpp" },
];

const CreateFileDialog = ({ workspaceId, onCreated }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError("");
    setLoading(true);
    try {
      const response = await fileApi.create(workspaceId, name.trim());
      onCreated(response.data.file);
      setName("");
      setOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create file");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-rose-400/30 text-white/50 hover:text-white text-sm transition-all duration-300"
      >
        <Plus className="w-4 h-4" />
        New File
      </button>
    );
  }

  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-3">
      <form onSubmit={handleCreate} className="space-y-2">
        <div className="flex items-center gap-2">
          <FilePlus2 className="w-4 h-4 text-white/30 shrink-0" />
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="filename.ext"
            className="h-8 text-sm bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-lg"
          />
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setError("");
              setName("");
            }}
            className="text-white/30 hover:text-white shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && <p className="text-xs text-rose-400 pl-6">{error}</p>}

        <div className="flex flex-wrap gap-1.5 pl-6">
          {QUICK_TEMPLATES.map((tpl) => (
            <button
              key={tpl.ext}
              type="button"
              onClick={() =>
                setName(name.includes(".") ? name : `untitled.${tpl.ext}`)
              }
              className="text-[10px] px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
            >
              {tpl.label}
            </button>
          ))}
        </div>

        <Button
          type="submit"
          size="sm"
          disabled={loading || !name.trim()}
          className="w-full h-8 bg-gradient-to-r from-rose-500 to-rose-400 hover:from-rose-400 hover:to-rose-300 text-white text-xs font-semibold rounded-lg"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            "Create"
          )}
        </Button>
      </form>
    </div>
  );
};

export default CreateFileDialog;
