import { useState, useRef, useEffect } from 'react';
import { fileApi } from '../api/fileApi';
import { LANGUAGE_META } from '../utils/languageMap';
import { Pencil, Trash2, Loader2, Check, X, File, Folder } from 'lucide-react';

const FileTreeItem = ({ file, workspaceId, isActive, onSelect, onRenamed, onDeleted }) => {
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

  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(file.name);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
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
      <div className="flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-300" style={pressed}>
        <span className="text-xs truncate" style={{ color: '#6B4A3A' }}>
          Delete "{file.name}"?
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleDelete}
            disabled={busy}
            className="p-1 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95"
            style={raisedSm}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#C1652F';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#787B85';
            }}
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: '#C1652F' }} /> : <Check className="w-3.5 h-3.5" style={{ color: '#6B9E6B' }} />}
          </button>
          <button
            onClick={() => setConfirmingDelete(false)}
            className="p-1 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95"
            style={raisedSm}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#C1652F';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#787B85';
            }}
          >
            <X className="w-3.5 h-3.5" style={{ color: '#787B85' }} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-all duration-300 ${
        isActive 
          ? 'shadow-[inset_3px_3px_6px_#a0a5ae,_inset_-3px_-3px_6px_#e8ecf4,_0_0_0_2px_#C1652F]' 
          : 'hover:shadow-[inset_2px_2px_4px_#a0a5ae,_inset_-2px_-2px_4px_#e8ecf4]'
      }`}
      style={{
        background: isActive 
          ? 'linear-gradient(160deg, #E3E5E9 0%, #F0F1F4 100%)'
          : 'linear-gradient(160deg, #F7F8FA 0%, #E7E9EC 100%)',
        boxShadow: isActive
          ? 'inset 3px 3px 6px #a0a5ae, inset -3px -3px 6px #e8ecf4, 0 0 0 2px #C1652F'
          : '2px 2px 4px #a0a5ae, -2px -2px 4px #e8ecf4, inset 1px 1px 2px rgba(255,255,255,0.6), inset -1px -1px 2px rgba(0,0,0,0.04)',
        border: isActive
          ? 'none'
          : '1px solid rgba(255,255,255,0.5)'
      }}
      onClick={() => !renaming && onSelect(file)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div
          className="text-[9px] font-bold w-7 h-5 shrink-0 rounded flex items-center justify-center transition-all duration-300"
          style={{
            background: isActive 
              ? `linear-gradient(160deg, ${meta.color}33, ${meta.color}22)`
              : `linear-gradient(160deg, ${meta.color}22, ${meta.color}11)`,
            color: meta.color,
            boxShadow: isActive
              ? 'inset 1px 1px 2px rgba(0,0,0,0.08), inset -1px -1px 2px rgba(255,255,255,0.4)'
              : 'inset 1px 1px 2px rgba(255,255,255,0.6), inset -1px -1px 2px rgba(0,0,0,0.04)',
            border: isActive
              ? `1px solid ${meta.color}44`
              : '1px solid rgba(255,255,255,0.3)'
          }}
        >
          {meta.label}
        </div>

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
            className="text-xs rounded-lg px-2 py-1 outline-none transition-all duration-300 w-28"
            style={{
              background: 'linear-gradient(160deg, #E3E5E9 0%, #F0F1F4 100%)',
              boxShadow: 'inset 2px 2px 4px #a0a5ae, inset -2px -2px 4px #e8ecf4, 0 0 0 2px #C1652F',
              color: '#2B2B2F',
              border: 'none'
            }}
          />
        ) : (
          <span 
            className={`text-sm truncate transition-all duration-300 ${
              isActive ? 'font-medium' : ''
            }`}
            style={{
              color: isActive ? '#2B2B2F' : '#787B85'
            }}
          >
            {file.name}
          </span>
        )}
      </div>

      {!renaming && (
        <div className={`flex items-center gap-0.5 shrink-0 transition-all duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setRenaming(true);
            }}
            className="p-1 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95"
            style={raisedSm}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#C1652F';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#787B85';
            }}
          >
            <Pencil className="w-3 h-3" style={{ color: '#787B85' }} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setConfirmingDelete(true);
            }}
            className="p-1 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95"
            style={raisedSm}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(160deg, #F8F0F0 0%, #E8D8D8 100%)';
              e.currentTarget.style.color = '#C1652F';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(160deg, #F7F8FA 0%, #E7E9EC 100%)';
              e.currentTarget.style.color = '#787B85';
            }}
          >
            <Trash2 className="w-3 h-3" style={{ color: '#787B85' }} />
          </button>
        </div>
      )}
    </div>
  );
};

export default FileTreeItem;