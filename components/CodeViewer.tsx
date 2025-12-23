import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeViewerProps {
  title: string;
  code: string;
  language: 'solidity' | 'python' | 'dockerfile' | 'markdown';
}

const CodeViewer: React.FC<CodeViewerProps> = ({ title, code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-slate-700" />
                <div className="w-3 h-3 rounded-full bg-slate-700" />
                <div className="w-3 h-3 rounded-full bg-slate-700" />
            </div>
            <span className="ml-3 text-sm font-mono text-slate-400">{title}</span>
        </div>
        <button 
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-slate-800 transition-colors text-xs font-medium text-slate-400 hover:text-white"
        >
            {copied ? <Check size={14} className="text-vector-400" /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="relative flex-1 overflow-auto bg-[#020617] p-4 font-mono text-sm">
        <pre className="text-slate-300">
          <code>
            {code.split('\n').map((line, i) => (
                <div key={i} className="table-row">
                    <span className="table-cell text-right pr-4 text-slate-700 select-none w-8">{i + 1}</span>
                    <span className="table-cell whitespace-pre-wrap break-all">
                        {highlightSyntax(line, language)}
                    </span>
                </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
};

// Simple regex-based highlighter for visual flair (not a full parser)
const highlightSyntax = (line: string, lang: 'solidity' | 'python' | 'dockerfile' | 'markdown') => {
    if (lang === 'markdown') {
        if (line.trim().startsWith('#')) {
             return [<span key="header" className="text-vector-400 font-bold">{line}</span>];
        }
        if (line.trim().startsWith('---')) {
             return [<span key="hr" className="text-slate-500">{line}</span>];
        }
        const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);
        return parts.map((part, idx) => {
             if (part.startsWith('**') && part.endsWith('**')) {
                 return <span key={idx} className="font-bold text-white">{part}</span>;
             }
             if (part.startsWith('`') && part.endsWith('`')) {
                 return <span key={idx} className="text-yellow-300 bg-slate-800 rounded px-1">{part}</span>;
             }
             return <span key={idx} className="text-slate-300">{part}</span>;
        });
    }

    let keywords: string[] = [];
    let types: string[] = [];
    
    if (lang === 'solidity') {
        keywords = ['pragma', 'contract', 'interface', 'function', 'struct', 'event', 'error', 'modifier', 'returns', 'external', 'public', 'view', 'override', 'import', 'using', 'for', 'if', 'else', 'return', 'mapping', 'address', 'uint256', 'bytes', 'calldata', 'memory', 'bool', 'string'];
        types = ['IERC20', 'ERC4626', 'AccessControl', 'ReentrancyGuard', 'UniswapV3Adapter', 'INonfungiblePositionManager', 'IStrategyAdapter'];
    } else if (lang === 'python') {
        keywords = ['import', 'def', 'return', 'if', 'else', 'from', 'as', 'try', 'except', 'raise', 'class', 'while'];
        types = ['pd', 'np', 'arch_model'];
    } else if (lang === 'dockerfile') {
        keywords = ['FROM', 'RUN', 'CMD', 'LABEL', 'EXPOSE', 'ENV', 'ADD', 'COPY', 'ENTRYPOINT', 'VOLUME', 'USER', 'WORKDIR', 'ARG', 'ONBUILD', 'STOPSIGNAL', 'HEALTHCHECK', 'SHELL'];
    }

    const words = line.split(/(\s+|[(){}[\],.;])/);

    return words.map((word, idx) => {
        if (keywords.includes(word)) {
            return <span key={idx} className="text-purple-400">{word}</span>;
        }
        if (types.includes(word)) {
            return <span key={idx} className="text-yellow-300">{word}</span>;
        }
        if (word.startsWith('"') || word.startsWith("'") || word.endsWith('"') || word.endsWith("'")) {
             return <span key={idx} className="text-green-400">{word}</span>;
        }
        if (word.startsWith('//') || word.startsWith('#')) {
             return <span key={idx} className="text-slate-500">{word}</span>;
        }
        // Numbers
        if (/^\d+$/.test(word)) {
            return <span key={idx} className="text-orange-400">{word}</span>;
        }
        return <span key={idx}>{word}</span>;
    });
};

export default CodeViewer;