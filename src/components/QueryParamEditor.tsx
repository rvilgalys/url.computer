'use client';

import { useState, useEffect, useRef } from 'react';
import CopyButton from './CopyButton';
import { searchParamsToObject, objectToSearchParams } from '../lib/url';

interface QueryParamEditorProps {
  searchParams: URLSearchParams;
  onSearchParamsChange: (newSearchParams: URLSearchParams) => void;
}

interface QueryParam {
  key: string;
  value: string;
  id: string;
}

export default function QueryParamEditor({ searchParams, onSearchParamsChange }: QueryParamEditorProps) {
  const [params, setParams] = useState<QueryParam[]>([]);
  const paramsRef = useRef<QueryParam[]>([]);
  
  // Keep ref in sync with state
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  // Convert URLSearchParams to local state on prop change
  useEffect(() => {
    const paramEntries = Array.from(searchParams.entries()).map(([key, value]) => {
      // Try to find existing param with same key and value to preserve ID
      const existingParam = paramsRef.current.find(p => p.key === key && p.value === value);
      return existingParam || {
        key,
        value,
        id: `param-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Stable unique ID
      };
    });
    
    // Only update state if the params actually changed to avoid circular updates
    const currentParamsSerialized = JSON.stringify(paramsRef.current);
    const newParamsSerialized = JSON.stringify(paramEntries);
    
    if (currentParamsSerialized !== newParamsSerialized) {
      setParams(paramEntries);
    }
  }, [searchParams]);

  // Update parent component when local state changes
  const updateParent = (newParams: QueryParam[]) => {
    const newSearchParams = new URLSearchParams();
    newParams.forEach(param => {
      if (param.key.trim()) { // Only add params with non-empty keys
        newSearchParams.set(param.key, param.value);
      }
    });
    onSearchParamsChange(newSearchParams);
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
    const newParam: QueryParam = {
      key: '',
      value: '',
      id: `new-${Date.now()}`, // Temporary unique ID
    };
    const newParams = [...params, newParam];
    setParams(newParams);
    // Don't update parent until user starts typing
  };

  if (params.length === 0) {
    return (
      <div className="col-span-1">
        <h3 className="text-xs text-elf-light-blue uppercase mb-1 tracking-wide">
          Query Parameters
        </h3>
        <div className="text-sm text-elf-light-blue/50 italic mb-2">
          No query parameters
        </div>
        <button
          onClick={handleAddParam}
          className="w-full text-left p-2 text-elf-yellow hover:text-elf-orange hover:bg-elf-mid-blue/20 rounded-md transition-colors font-medium"
        >
          + Add Parameter
        </button>
      </div>
    );
  }

  return (
    <div className="col-span-1">
      <h3 className="text-xs text-elf-light-blue uppercase mb-1 tracking-wide">
        Query Parameters
      </h3>
      <div className="space-y-2">
        {params.map((param) => (
          <div key={param.id} className="flex items-center gap-2">
            <input
              type="text"
              value={param.key}
              onChange={(e) => handleParamChange(param.id, 'key', e.target.value)}
              className="font-mono w-1/3 p-2 rounded-md border border-elf-mid-blue/30 bg-elf-dark-blue text-elf-light-blue focus:outline-none focus:ring-2 focus:ring-elf-yellow focus:border-transparent"
              placeholder="key"
            />
            <input
              type="text"
              value={param.value}
              onChange={(e) => handleParamChange(param.id, 'value', e.target.value)}
              className="font-mono w-2/3 p-2 rounded-md border border-elf-mid-blue/30 bg-elf-dark-blue text-elf-light-blue focus:outline-none focus:ring-2 focus:ring-elf-yellow focus:border-transparent"
              placeholder="value"
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
              title="Delete Parameter"
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
          + Add Parameter
        </button>
      </div>
    </div>
  );
}