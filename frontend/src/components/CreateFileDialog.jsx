import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fileApi } from "../api/fileApi";
import { Plus, Loader2, X, FilePlus2, FolderPlus } from "lucide-react";

const QUICK_TEMPLATES = [
  { label: "HTML", ext: "html" },
  { label: "CSS", ext: "css" },
  { label: "JS", ext: "js" },
  { label: "Python", ext: "py" },
  { label: "C++", ext: "cpp" },
];

const CreateFileDialog = ({ workspaceId, onCreated }) => {
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

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

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
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 group"
        style={raisedSm}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#C1652F';
          e.currentTarget.style.borderColor = 'rgba(193,101,47,0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#787B85';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
        }}
      >
        <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" style={{ color: '#C1652F' }} />
        <span style={{ color: '#787B85' }}>New File</span>
      </button>
    );
  }

  return (
    <div className="rounded-xl p-4 transition-all duration-300" style={pressed}>
      <form onSubmit={handleCreate} className="space-y-3">
        <div className="flex items-center gap-2">
          <FolderPlus className="w-4 h-4 shrink-0" style={{ color: '#C1652F' }} />
          <div className="relative flex-1">
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="filename.ext"
              className="transition-all duration-300"
              style={{
                ...(focused ? pressed : raisedSm),
                borderRadius: '10px',
                border: focused 
                  ? '2px solid #C1652F' 
                  : '1px solid rgba(255,255,255,0.5)',
                color: '#2B2B2F',
                padding: '8px 12px',
                fontSize: '13px',
                height: '36px',
                background: focused 
                  ? "linear-gradient(160deg, #E3E5E9 0%, #F0F1F4 100%)"
                  : "linear-gradient(160deg, #F7F8FA 0%, #E7E9EC 100%)",
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setError("");
              setName("");
            }}
            className="p-1.5 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95"
            style={raisedSm}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#C1652F';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#787B85';
            }}
          >
            <X className="w-4 h-4" style={{ color: '#787B85' }} />
          </button>
        </div>

        {error && (
          <p className="text-xs pl-6" style={{ color: '#C1652F' }}>
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-1.5 pl-6">
          <span className="text-[10px] font-medium" style={{ color: '#787B85' }}>
            Templates:
          </span>
          {QUICK_TEMPLATES.map((tpl) => (
            <button
              key={tpl.ext}
              type="button"
              onClick={() =>
                setName(name.includes(".") ? name : `untitled.${tpl.ext}`)
              }
              className="text-[10px] px-2.5 py-1 rounded-md transition-all duration-300 hover:scale-105 active:scale-95"
              style={raisedSm}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#C1652F';
                e.currentTarget.style.borderColor = 'rgba(193,101,47,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#787B85';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
              }}
            >
              {tpl.label}
            </button>
          ))}
        </div>

        <Button
          type="submit"
          size="sm"
          disabled={loading || !name.trim()}
          className="w-full font-bold transition-all duration-300 hover:scale-[1.02] active:scale-95"
          style={{
            background: loading || !name.trim()
              ? 'linear-gradient(160deg, #E8ECF4 0%, #D5D9E0 100%)'
              : "linear-gradient(160deg, #D07B47, #B0552A)",
            boxShadow: loading || !name.trim()
              ? '2px 2px 4px rgba(163,167,178,0.3), -2px -2px 4px rgba(255,255,255,0.5)'
              : "4px 4px 10px rgba(163,167,178,0.4), -2px -2px 6px rgba(255,255,255,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
            borderRadius: '10px',
            color: loading || !name.trim() ? '#787B85' : '#FBF6F1',
            border: loading || !name.trim()
              ? '1px solid rgba(163,167,178,0.2)'
              : '1px solid rgba(255,255,255,0.15)',
            padding: '8px 12px',
            fontSize: '12px',
            height: '32px'
          }}
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