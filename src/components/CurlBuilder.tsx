
import React, { useState, useEffect } from 'react';
import { generateCurlCommand } from '../lib/curl';
import { CurlOptions } from '../types';
import CopyButton from './CopyButton';

interface CurlBuilderProps {
  url: string;
  curlState: CurlOptions;
  onCurlChange: (newState: CurlOptions) => void;
}

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

const RECIPES = [
  { label: 'Verbose (-v)', action: (s: CurlOptions) => ({ ...s, options: [...s.options, '-v'] }) },
  { label: 'JSON Body', action: (s: CurlOptions) => ({ ...s, method: 'POST', headers: { ...s.headers, 'Content-Type': 'application/json' }, body: '{\n  "key": "value"\n}' }) },
  { label: 'Bearer Token', action: (s: CurlOptions) => ({ ...s, headers: { ...s.headers, 'Authorization': 'Bearer YOUR_TOKEN' } }) },
  { label: 'Follow Redirects (-L)', action: (s: CurlOptions) => ({ ...s, options: [...s.options, '-L'] }) },
  { label: 'Insecure (-k)', action: (s: CurlOptions) => ({ ...s, options: [...s.options, '-k'] }) },
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

  const applyRecipe = (recipe: typeof RECIPES[0]) => {
    onCurlChange(recipe.action(curlState));
  };

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

      <div className="flex gap-2 items-start mb-6">
        <div className="flex-1 bg-elf-dark-blue rounded-md p-4 font-mono text-elf-light-blue border border-elf-mid-blue/30 focus-within:ring-2 focus-within:ring-elf-yellow focus-within:border-transparent transition-all">
          <textarea
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            className="w-full h-32 bg-transparent resize-y focus:outline-none text-sm md:text-base"
            spellCheck={false}
          />
        </div>
        <CopyButton 
          textToCopy={() => command}
          className="p-3 text-elf-light-blue/60 hover:text-elf-light-blue hover:bg-elf-mid-blue/20 border border-elf-mid-blue/30 rounded-md bg-elf-dark-blue"
          title="Copy Command"
        />
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
                        className="px-3 py-1 bg-elf-mid-blue/20 hover:bg-elf-mid-blue/40 text-elf-light-blue hover:text-white rounded-full text-sm transition-colors border border-elf-mid-blue/30"
                    >
                        {recipe.label}
                    </button>
                ))}
            </div>
        </div>
      </div>
    </section>
  );
}
