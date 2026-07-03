import { useState, useRef, useEffect } from 'react';
import { fileApi } from '../api/fileApi';
import { LANGUAGE_META } from '../utils/languageMap';
import { Pencil, Trash2, Loader2, Check, X } from 'lucide-react';

const FileTreeItem = ({ file, workspaceId, isActive, onSelect, onRenamed, onDeleted }) => {
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(file.name);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  const meta = LANGUAGE_META[file.language] || LANGUAGE_META.plaintext;

  useEffect(() => {
    if (renaming) inputRef.current?.focus();
  }, [renaming]);

  const handleRename = async () => {
    if (!newName.trim() || newName === file.name) {
      setRenaming(false);
      setNewName(file.name);
      return;
    }
    setBusy(true);
    try {
      const response = await fileApi.update(workspaceId, file._id, { name: newName.trim() });
      onRenamed(response.data.file);
      setRenaming(false);
    } catch (err) {
      console.error(err);
      setNewName(file.name);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await fileApi.remove(workspaceId, file._id);
      onDeleted(file._id);
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  if (confirmingDelete) {
    return (
      <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
        <span className="text-xs text-white/60 truncate">Delete "{file.name}"?</span>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleDelete}
            disabled={busy}
            className="p-1 rounded hover:bg-rose-500/20 text-rose-400"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setConfirmingDelete(false)}
            className="p-1 rounded hover:bg-white/10 text-white/40"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition-all duration-200 ${
        isActive ? 'bg-white/10 border border-rose-400/20' : 'hover:bg-white/5 border border-transparent'
      }`}
      onClick={() => !renaming && onSelect(file)}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span
          className="text-[9px] font-bold w-7 h-5 shrink-0 rounded flex items-center justify-center"
          style={{ backgroundColor: `${meta.color}22`, color: meta.color }}
        >
          {meta.label}
        </span>

        {renaming ? (
          <input
            ref={inputRef}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') {
                setRenaming(false);
                setNewName(file.name);
              }
            }}
            onBlur={handleRename}
            className="bg-white/10 text-xs text-white rounded px-1.5 py-0.5 outline-none border border-rose-400/40 w-28"
          />
        ) : (
          <span className={`text-sm truncate ${isActive ? 'text-white' : 'text-white/60'}`}>
            {file.name}
          </span>
        )}
      </div>

      {!renaming && (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setRenaming(true);
            }}
            className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white/70"
          >
            <Pencil className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setConfirmingDelete(true);
            }}
            className="p-1 rounded hover:bg-rose-500/10 text-white/30 hover:text-rose-400"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};

export default FileTreeItem;