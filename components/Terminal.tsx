
import React, { useEffect, useRef } from 'react';

interface TerminalProps {
  logs: string[];
}

const Terminal: React.FC<TerminalProps> = ({ logs }) => {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="glass-panel rounded-lg p-4 h-48 overflow-y-auto font-mono text-xs md:text-sm border-emerald-500/30" ref={terminalRef}>
      <div className="flex items-center gap-2 mb-2 border-b border-emerald-500/20 pb-1">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
        <span className="text-emerald-500/50 uppercase tracking-widest">System_Logs</span>
      </div>
      {logs.map((log, i) => (
        <div key={i} className="mb-1">
          <span className="text-emerald-800">[{new Date().toLocaleTimeString()}]</span>{' '}
          <span className={`${log.includes('CRITICAL') ? 'text-red-400' : log.includes('SUCCESS') ? 'text-cyan-400' : 'text-emerald-400'}`}>
            {log}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Terminal;
