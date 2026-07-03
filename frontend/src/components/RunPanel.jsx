import { useState, useRef, useEffect } from 'react';
import { executionApi } from '../api/executionApi';
import { Button } from '@/components/ui/button';
import { Play, Loader2, Terminal, Trash2 } from 'lucide-react';

const RunPanel = ({ workspaceId, file }) => {
  const [stdin, setStdin] = useState('');
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState([]); // [{ id, stdin, result, error }]
  const outputEndRef = useRef(null);

  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, running]);

  const handleRun = async () => {
    setRunning(true);
    const entryId = Date.now();
    try {
      const response = await executionApi.run(workspaceId, {
        language: file.language,
        content: file.content,
        stdin,
      });
      setHistory((prev) => [...prev, { id: entryId, stdin, result: response.data, error: null }]);
    } catch (err) {
      setHistory((prev) => [
        ...prev,
        { id: entryId, stdin, result: null, error: err.response?.data?.message || 'Execution failed' },
      ]);
    } finally {
      setRunning(false);
    }
  };

  const handleClear = () => setHistory([]);

  return (
    <div className="flex flex-col h-full border-l border-white/10">
      <div className="flex items-center justify-between px-4 h-9 border-b border-white/5 bg-white/[0.02] shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-white/40" />
          <span className="text-xs text-white/40">Terminal</span>
        </div>
        <div className="flex items-center gap-1">
          {history.length > 0 && (
            <button
              onClick={handleClear}
              className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white/60"
              title="Clear terminal"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <Button
            size="sm"
            onClick={handleRun}
            disabled={running}
            className="h-6 px-3 ml-1 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-black text-xs font-semibold rounded-lg"
          >
            {running ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <>
                <Play className="w-3 h-3 mr-1 fill-current" />
                Run
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Terminal transcript */}
      <div className="flex-1 overflow-y-auto px-4 py-3 bg-[#0b0b0b] font-mono text-xs space-y-4">
        {history.length === 0 && !running && (
          <p className="text-white/15">Type any input below (if your program needs it), then click Run.</p>
        )}

        {history.map((entry) => (
          <TerminalEntry key={entry.id} entry={entry} fileName={file.name} />
        ))}

        {running && (
          <div className="flex items-center gap-2 text-white/30">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Running {file.name}...
          </div>
        )}
        <div ref={outputEndRef} />
      </div>

      {/* Stdin input — always visible, terminal-style */}
      <div className="border-t border-white/10 shrink-0">
        <div className="flex items-center gap-1.5 px-4 pt-2">
          <span className="text-[10px] text-white/25 uppercase tracking-wide">Input (stdin)</span>
          <span className="text-[10px] text-white/15">— one value per line, in the order your program reads them</span>
        </div>
        <textarea
          value={stdin}
          onChange={(e) => setStdin(e.target.value)}
          placeholder={'e.g.\n5\nAlice\n10 20 30'}
          rows={3}
          className="w-full px-4 py-2 bg-transparent text-xs text-emerald-300/80 placeholder:text-white/15 outline-none resize-none font-mono"
        />
      </div>
    </div>
  );
};

const TerminalEntry = ({ entry, fileName }) => {
  const { stdin, result, error } = entry;
  const compileFailed = result?.compile;
  const runFailed = result?.run && result.run.code !== 0;

  return (
    <div className="border-l-2 border-white/10 pl-3">
      <p className="text-white/30">
        <span className="text-emerald-400/70">$</span> run {fileName}
      </p>

      {stdin && (
        <pre className="text-white/40 mt-1 whitespace-pre-wrap">
          {stdin.split('\n').map((line, i) => (
            <span key={i} className="block">
              <span className="text-white/20">{'>'} </span>
              {line}
            </span>
          ))}
        </pre>
      )}

      {error && <p className="text-rose-400 mt-1">{error}</p>}

      {compileFailed && (
        <div className="mt-1">
          <p className="text-amber-400">Compilation Error:</p>
          <pre className="text-rose-400 whitespace-pre-wrap">{result.compile.stderr}</pre>
        </div>
      )}

      {result && !compileFailed && (
        <>
          {result.run.stdout && (
            <pre className="text-white/70 mt-1 whitespace-pre-wrap">{result.run.stdout}</pre>
          )}
          {result.run.stderr && (
            <pre className="text-rose-400 mt-1 whitespace-pre-wrap">{result.run.stderr}</pre>
          )}
          {!result.run.stdout && !result.run.stderr && (
            <p className="text-white/20 mt-1">(no output)</p>
          )}
          {runFailed && result.run.message && (
            <p className="text-amber-400/70 mt-1">{result.run.message}</p>
          )}
          {result.run.time && (
            <p className="text-white/15 mt-1 text-[10px]">
              {result.run.time}s
              {result.run.memory ? ` · ${Math.round(result.run.memory / 1024)}MB` : ''}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default RunPanel;