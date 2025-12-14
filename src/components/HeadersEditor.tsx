'use client';

import { useState, useEffect, useRef } from 'react';
import CopyButton from './CopyButton';

interface HeadersEditorProps {
  headers: Record<string, string>;
  onHeadersChange: (newHeaders: Record<string, string>) => void;
}

interface HeaderParam {
  key: string;
  value: string;
  id: string;
}

export default function HeadersEditor({ headers, onHeadersChange }: HeadersEditorProps) {
  const [params, setParams] = useState<HeaderParam[]>([]);
  const paramsRef = useRef<HeaderParam[]>([]);
  
  // Keep ref in sync with state
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  // Convert headers object to local state on prop change
  useEffect(() => {
    const headerEntries = Object.entries(headers).map(([key, value]) => {
      // Try to find existing param with same key and value to preserve ID
      const existingParam = paramsRef.current.find(p => p.key === key && p.value === value);
      return existingParam || {
        key,
        value,
        id: `header-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Stable unique ID
      };
    });
    
    // Only update state if the params actually changed to avoid circular updates
    // We need to be careful here because object order isn't guaranteed, but for small headers it's usually fine.
    // A better check might be needed if we see issues.
    const currentParamsSerialized = JSON.stringify(paramsRef.current.map(({key, value}) => ({key, value})));
    const newParamsSerialized = JSON.stringify(headerEntries.map(({key, value}) => ({key, value})));
    
    if (currentParamsSerialized !== newParamsSerialized) {
      setParams(headerEntries);
    }
  }, [headers]);

  // Update parent component when local state changes
  const updateParent = (newParams: HeaderParam[]) => {
    const newHeaders: Record<string, string> = {};
    newParams.forEach(param => {
      if (param.key.trim()) { // Only add params with non-empty keys
        newHeaders[param.key] = param.value;
      }
    });
    onHeadersChange(newHeaders);
  };

  const handleParamChange = (id: string, field: 'key' | 'value', newValue: string) => {
    const newParams = params.map(param => 
      param.id === id ? { ...param, [field]: newValue } : param
    );
    setParams(newParams);
    updateParent(newParams);
  };

  const handleDeleteParam = (id: string) => {
    const newParams = params.filter(param => param.id !== id);
    setParams(newParams);
    updateParent(newParams);
  };

  const handleAddParam = () => {
    const newParam: HeaderParam = {
      key: '',
      value: '',
      id: `new-header-${Date.now()}`, // Temporary unique ID
    };
    const newParams = [...params, newParam];
    setParams(newParams);
    // Don't update parent until user starts typing
  };

  if (params.length === 0) {
    return (
      <div className="mt-4">
        <h3 className="text-xs text-elf-light-blue uppercase mb-1 tracking-wide">
          Headers
        </h3>
        <div className="text-sm text-elf-light-blue/50 italic mb-2">
          No headers
        </div>
        <button
          onClick={handleAddParam}
          className="w-full text-left p-2 text-elf-yellow hover:text-elf-orange hover:bg-elf-mid-blue/20 rounded-md transition-colors font-medium"
        >
          + Add Header
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h3 className="text-xs text-elf-light-blue uppercase mb-1 tracking-wide">
        Headers
      </h3>
      <div className="space-y-2">
        {params.map((param) => (
          <div key={param.id} className="flex items-center gap-2">
            <input
              type="text"
              value={param.key}
              onChange={(e) => handleParamChange(param.id, 'key', e.target.value)}
              className="font-mono w-1/3 p-2 rounded-md border border-elf-mid-blue/30 bg-elf-dark-blue text-elf-light-blue focus:outline-none focus:ring-2 focus:ring-elf-yellow focus:border-transparent"
              placeholder="Header"
            />
            <input
              type="text"
              value={param.value}
              onChange={(e) => handleParamChange(param.id, 'value', e.target.value)}
              className="font-mono w-2/3 p-2 rounded-md border border-elf-mid-blue/30 bg-elf-dark-blue text-elf-light-blue focus:outline-none focus:ring-2 focus:ring-elf-yellow focus:border-transparent"
              placeholder="Value"
            />
            <CopyButton
              textToCopy={param.value}
              title="Copy Value"
              size="sm"
              className="text-elf-light-blue/60 hover:text-elf-light-blue hover:bg-elf-mid-blue/20"
            />
            <button
              onClick={() => handleDeleteParam(param.id)}
              className="p-2 rounded-md text-elf-light-blue/60 hover:bg-elf-orange/20 hover:text-elf-orange transition-colors"
              title="Delete Header"
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ))}
        <button
          onClick={handleAddParam}
          className="w-full text-left p-2 text-elf-yellow hover:text-elf-orange hover:bg-elf-mid-blue/20 rounded-md transition-colors font-medium"
        >
          + Add Header
        </button>
      </div>
    </div>
  );
}
