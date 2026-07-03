import { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { fileApi } from '../api/fileApi';
import { useDebouncedCallback } from '../hooks/useDebounce';
import { Loader2, Check, Circle } from 'lucide-react';

const FileEditor = ({ workspaceId, file, onContentSynced }) => {
  const [content, setContent] = useState(file.content ?? '');
  const [saveState, setSaveState] = useState('saved'); // 'saved' | 'saving' | 'unsaved'
  const editorRef = useRef(null);
  const latestContentRef = useRef(content);

  // Reset local content whenever a different file is opened
  useEffect(() => {
    setContent(file.content ?? '');
    latestContentRef.current = file.content ?? '';
    setSaveState('saved');
  }, [file._id]);

  const persist = useCallback(
    async (value) => {
      setSaveState('saving');
      try {
        const response = await fileApi.update(workspaceId, file._id, { content: value });
        setSaveState('saved');
        onContentSynced?.(response.data.file);
      } catch (err) {
        console.error(err);
        setSaveState('unsaved');
      }
    },
    [workspaceId, file._id, onContentSynced]
  );

  const [debouncedSave] = useDebouncedCallback(persist, 1200);

  const handleChange = (value) => {
    const nextValue = value ?? '';
    setContent(nextValue);
    latestContentRef.current = nextValue;
    setSaveState('unsaved');
    debouncedSave(nextValue);
  };

  const handleManualSave = useCallback(() => {
    persist(latestContentRef.current);
  }, [persist]);

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, handleManualSave);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 h-9 border-b border-white/5 bg-white/[0.02] shrink-0">
        <span className="text-xs text-white/40 truncate">{file.name}</span>
        <SaveIndicator state={saveState} />
      </div>

      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={file.language}
          value={content}
          theme="vs-dark"
          onChange={handleChange}
          onMount={handleEditorMount}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 12 },
            automaticLayout: true,
            wordWrap: 'on',
          }}
        />
      </div>
    </div>
  );
};

const SaveIndicator = ({ state }) => {
  if (state === 'saving') {
    return (
      <span className="flex items-center gap-1.5 text-[11px] text-white/30">
        <Loader2 className="w-3 h-3 animate-spin" />
        Saving...
      </span>
    );
  }
  if (state === 'unsaved') {
    return (
      <span className="flex items-center gap-1.5 text-[11px] text-amber-400/70">
        <Circle className="w-2 h-2 fill-current" />
        Unsaved
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-[11px] text-emerald-400/60">
      <Check className="w-3 h-3" />
      Saved
    </span>
  );
};

export default FileEditor;