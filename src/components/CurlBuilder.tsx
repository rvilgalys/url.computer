
import React, { useState, useEffect } from 'react';
import { generateCurlCommand } from '../lib/curl';
import { CurlOptions } from '../types';
import CopyButton from './CopyButton';
import HeadersEditor from './HeadersEditor';

interface CurlBuilderProps {
  url: string;
  curlState: CurlOptions;
  onCurlChange: (newState: CurlOptions) => void;
}

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

interface Recipe {
  label: string;
  action: (s: CurlOptions) => CurlOptions;
  color: string;
}

const RECIPES: Recipe[] = [
  { 
    label: 'Verbose (-v)', 
    action: (s: CurlOptions) => {
      if (s.options.includes('-v')) return s;
      return { ...s, options: [...s.options, '-v'] };
    },
    color: 'bg-elf-mid-blue/70 text-white'
  },
  { 
    label: 'JSON Body', 
    action: (s: CurlOptions) => ({ 
      ...s, 
      method: 'POST', 
      headers: { ...s.headers, 'Content-Type': 'application/json' }, 
      body: '{\n  "key": "value"\n}' 
    }),
    color: 'bg-elf-yellow text-elf-dark-blue'
  },
  { 
    label: 'Bearer Token', 
    action: (s: CurlOptions) => ({ 
      ...s, 
      headers: { ...s.headers, 'Authorization': 'Bearer YOUR_TOKEN' } 
    }),
    color: 'bg-elf-mid-blue/70 text-white'
  },
  { 
    label: 'Follow Redirects (-L)', 
    action: (s: CurlOptions) => {
      if (s.options.includes('-L')) return s;
      return { ...s, options: [...s.options, '-L'] };
    },
    color: 'bg-elf-mid-blue/70 text-white'
  },
  { 
    label: 'Insecure (-k)', 
    action: (s: CurlOptions) => {
      if (s.options.includes('-k')) return s;
      return { ...s, options: [...s.options, '-k'] };
    },
    color: 'bg-elf-mid-blue/70 text-white'
  },
];

export default function CurlBuilder({ url, curlState, onCurlChange }: CurlBuilderProps) {
  const [command, setCommand] = useState('');

  useEffect(() => {
    setCommand(generateCurlCommand(url, curlState));
  }, [url, curlState]);

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onCurlChange({ ...curlState, method: e.target.value });
  };

  const handleReset = () => {
    onCurlChange({
      method: 'GET',
      headers: {},
      body: '',
      options: [],
    });
  };

  const applyRecipe = (recipe: Recipe) => {
    onCurlChange(recipe.action(curlState));
  };

  const handleHeadersChange = (newHeaders: Record<string, string>) => {
    onCurlChange({ ...curlState, headers: newHeaders });
  };

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onCurlChange({ ...curlState, body: e.target.value });
  };

  // Simple syntax highlighting
  const renderHighlightedCommand = (cmd: string) => {
    // This is a very basic highlighter. For production, a library like prismjs would be better.
    // But we want to keep it lightweight as per requirements.
    const parts = cmd.split(' ');
    return parts.map((part, index) => {
      let className = 'text-white';
      if (part === 'curl') className = 'text-elf-orange';
      else if (part.startsWith('-')) className = 'text-elf-yellow';
      else if (part.startsWith("'") || part.startsWith('"')) className = 'text-elf-light-blue';
      
      return <span key={index} className={className}>{part} </span>;
    });
  };

  const showBodyEditor = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(curlState.method) || curlState.body.length > 0;

  return (
    <section className="bg-elf-dark-blue/50 rounded-xl border border-elf-mid-blue/20 shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-elf-light-blue">cURL Builder</h2>
        <button
          onClick={handleReset}
          className="text-sm text-elf-light-blue/60 hover:text-elf-light-blue transition-colors"
        >
          Reset
        </button>
      </div>

      <div className="relative bg-elf-dark-blue rounded-md p-4 font-mono text-white border border-elf-mid-blue/30 mb-6 overflow-x-auto">
        <div className="absolute top-2 right-2">
            <CopyButton 
            textToCopy={() => command}
            className="flex items-center gap-2 px-3 py-1 bg-elf-yellow text-elf-dark-blue rounded-md hover:bg-elf-orange font-semibold text-sm transition-colors"
            title="Copy Command"
            label="Copy"
            />
        </div>
        <pre className="whitespace-pre-wrap break-all pr-20">
            <code>{renderHighlightedCommand(command)}</code>
        </pre>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex flex-col">
            <label className="text-xs text-elf-light-blue uppercase mb-1">Method</label>
            <select
            value={curlState.method}
            onChange={handleMethodChange}
            className="bg-elf-dark-blue border border-elf-mid-blue text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-elf-yellow"
            >
            {METHODS.map(m => (
                <option key={m} value={m}>{m}</option>
            ))}
            </select>
        </div>
        
        <div className="flex flex-col flex-1">
            <label className="text-xs text-elf-light-blue uppercase mb-1">Recipes</label>
            <div className="flex flex-wrap gap-2">
                {RECIPES.map((recipe) => (
                    <button
                        key={recipe.label}
                        onClick={() => applyRecipe(recipe)}
                        className={`px-3 py-1 rounded-full text-sm transition-transform hover:-translate-y-0.5 shadow-sm hover:shadow-md font-medium ${recipe.color}`}
                    >
                        {recipe.label}
                    </button>
                ))}
            </div>
        </div>
      </div>

      <HeadersEditor headers={curlState.headers} onHeadersChange={handleHeadersChange} />

      {showBodyEditor && (
        <div className="mt-6">
            <h3 className="text-xs text-elf-light-blue uppercase mb-1 tracking-wide">
                Request Body
            </h3>
            <textarea
                value={curlState.body}
                onChange={handleBodyChange}
                className="w-full h-32 bg-elf-dark-blue rounded-md p-4 font-mono text-white border border-elf-mid-blue/30 focus:outline-none focus:ring-2 focus:ring-elf-yellow focus:border-transparent text-sm md:text-base resize-y"
                placeholder='{ "key": "value" }'
                spellCheck={false}
            />
        </div>
      )}
    </section>
  );
}
