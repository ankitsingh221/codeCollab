import { useState, useRef, useEffect } from 'react';
import { executionApi } from '../api/executionApi';
import { Button } from '@/components/ui/button';
import { Play, Loader2, Terminal, Trash2, X } from 'lucide-react';

const RunPanel = ({ workspaceId, file }) => {
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

  const [stdin, setStdin] = useState('');
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState([]);
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
    <div className="flex flex-col h-full rounded-[20px] overflow-hidden" style={raised}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-10 shrink-0"
        style={{
          background: 'linear-gradient(160deg, #F7F8FA 0%, #E5E7EB 100%)',
          borderBottom: '1px solid rgba(163,167,178,0.2)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)'
        }}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #ff6b6b, #cc3333)',
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.1)'
              }}
            />
            <div className="w-2.5 h-2.5 rounded-full"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #ffd93d, #cc9900)',
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.1)'
              }}
            />
            <div className="w-2.5 h-2.5 rounded-full"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #6bcf7f, #2d8f47)',
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.1)'
              }}
            />
          </div>
          <Terminal className="w-3.5 h-3.5" style={{ color: '#787B85' }} />
          <span className="text-xs font-mono font-medium" style={{ color: '#787B85' }}>Terminal</span>
        </div>
        <div className="flex items-center gap-1">
          {history.length > 0 && (
            <button
              onClick={handleClear}
              className="p-1.5 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95"
              style={raisedSm}
              title="Clear terminal"
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#C1652F';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#787B85';
              }}
            >
              <Trash2 className="w-3.5 h-3.5" style={{ color: '#787B85' }} />
            </button>
          )}
          <Button
            size="sm"
            onClick={handleRun}
            disabled={running}
            className="h-7 px-3 ml-1 font-bold transition-all duration-300 hover:scale-[1.02] active:scale-95"
            style={{
              background: running
                ? 'linear-gradient(160deg, #E8ECF4 0%, #D5D9E0 100%)'
                : "linear-gradient(160deg, #D07B47, #B0552A)",
              boxShadow: running
                ? '2px 2px 4px rgba(163,167,178,0.3), -2px -2px 4px rgba(255,255,255,0.5)'
                : "4px 4px 10px rgba(163,167,178,0.4), -2px -2px 6px rgba(255,255,255,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
              borderRadius: '10px',
              color: running ? '#787B85' : '#FBF6F1',
              border: running
                ? '1px solid rgba(163,167,178,0.2)'
                : '1px solid rgba(255,255,255,0.15)',
              fontSize: '11px',
              padding: '4px 12px'
            }}
          >
            {running ? (
              <Loader2 className="w-3 h-3 animate-spin" style={{ color: '#C1652F' }} />
            ) : (
              <>
                <Play className="w-3 h-3 mr-1" />
                Run
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Terminal transcript */}
      <div className="flex-1 overflow-y-auto px-4 py-3 font-mono text-xs space-y-4"
        style={{
          background: '#F7F8FA',
          boxShadow: 'inset 0 2px 4px rgba(163,167,178,0.2)'
        }}
      >
        {history.length === 0 && !running && (
          <p className="text-center py-8" style={{ color: '#787B85' }}>
            Type any input below (if your program needs it), then click Run.
          </p>
        )}

        {history.map((entry) => (
          <TerminalEntry key={entry.id} entry={entry} fileName={file.name} />
        ))}

        {running && (
          <div className="flex items-center gap-2 p-2 rounded-lg" style={pressed}>
            <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: '#C1652F' }} />
            <span style={{ color: '#787B85' }}>Running {file.name}...</span>
          </div>
        )}
        <div ref={outputEndRef} />
      </div>

      {/* Stdin input */}
      <div className="shrink-0"
        style={{
          background: 'linear-gradient(160deg, #F7F8FA 0%, #E5E7EB 100%)',
          borderTop: '1px solid rgba(163,167,178,0.2)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)'
        }}
      >
        <div className="flex items-center gap-1.5 px-4 pt-2">
          <span className="text-[10px] font-medium uppercase tracking-wide" style={{ color: '#787B85' }}>
            Input (stdin)
          </span>
          <span className="text-[10px]" style={{ color: '#787B85' }}>
            — one value per line, in the order your program reads them
          </span>
        </div>
        <textarea
          value={stdin}
          onChange={(e) => setStdin(e.target.value)}
          placeholder={'e.g.\n5\nAlice\n10 20 30'}
          rows={3}
          className="w-full px-4 py-2 text-xs outline-none resize-none font-mono transition-all duration-300"
          style={{
            background: 'transparent',
            color: '#2B2B2F',
            placeholder: { color: '#787B85' }
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(163,167,178,0.2), 0 0 0 2px #C1652F';
            e.currentTarget.style.borderRadius = '8px';
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(163,167,178,0.1)';
            e.currentTarget.style.borderRadius = '0';
          }}
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
    <div className="border-l-2 pl-3 space-y-1.5" style={{ borderColor: 'rgba(163,167,178,0.2)' }}>
      <p style={{ color: '#787B85' }}>
        <span style={{ color: '#C1652F' }}>$</span> run {fileName}
      </p>

      {stdin && (
        <pre className="mt-1 whitespace-pre-wrap text-[11px]" style={{ color: '#787B85' }}>
          {stdin.split('\n').map((line, i) => (
            <span key={i} className="block">
              <span style={{ color: '#B8BDC6' }}>{'>'} </span>
              {line}
            </span>
          ))}
        </pre>
      )}

      {error && (
        <p className="mt-1 font-medium" style={{ color: '#C1652F' }}>
          {error}
        </p>
      )}

      {compileFailed && (
        <div className="mt-1 p-2 rounded-lg" style={pressed}>
          <p className="text-[11px] font-medium" style={{ color: '#C1652F' }}>Compilation Error:</p>
          <pre className="whitespace-pre-wrap text-[11px]" style={{ color: '#787B85' }}>{result.compile.stderr}</pre>
        </div>
      )}

      {result && !compileFailed && (
        <>
          {result.run.stdout && (
            <pre className="mt-1 whitespace-pre-wrap text-[11px]" style={{ color: '#2B2B2F' }}>{result.run.stdout}</pre>
          )}
          {result.run.stderr && (
            <pre className="mt-1 whitespace-pre-wrap text-[11px]" style={{ color: '#C1652F' }}>{result.run.stderr}</pre>
          )}
          {!result.run.stdout && !result.run.stderr && (
            <p className="mt-1 text-[11px]" style={{ color: '#787B85' }}>(no output)</p>
          )}
          {runFailed && result.run.message && (
            <p className="mt-1 text-[11px]" style={{ color: '#787B85' }}>{result.run.message}</p>
          )}
          {result.run.time && (
            <p className="mt-1 text-[10px] font-mono" style={{ color: '#787B85' }}>
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