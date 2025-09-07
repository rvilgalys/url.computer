'use client';

import { useState, useEffect } from 'react';
import { parseUrl, isValidUrl, updateUrlComponent } from '../lib/url';
import ProtocolEditor from './ProtocolEditor';
import HostnameEditor from './HostnameEditor';
import PathEditor from './PathEditor';
import FragmentEditor from './FragmentEditor';
import QueryParamEditor from './QueryParamEditor';

interface URLAnalyzerProps {
  url: string;
  onUrlChange: (newUrl: string) => void;
}

export default function URLAnalyzer({ url, onUrlChange }: URLAnalyzerProps) {
  const [urlInput, setUrlInput] = useState(url);
  const [isValid, setIsValid] = useState(true);

  // Update local input when prop changes
  useEffect(() => {
    setUrlInput(url);
    setIsValid(isValidUrl(url));
  }, [url]);

  // Handle URL input changes with debouncing
  const handleUrlInputChange = (newUrl: string) => {
    setUrlInput(newUrl);
    const valid = isValidUrl(newUrl);
    setIsValid(valid);
    
    // Update parent immediately for valid URLs
    if (valid) {
      onUrlChange(newUrl);
    }
    // For invalid URLs, we keep the input but don't update the parent
    // This allows users to type without breaking the URL parsing
  };

  // Handle query parameter changes
  const handleSearchParamsChange = (newSearchParams: URLSearchParams) => {
    const updatedUrl = updateUrlComponent(url, 'searchParams', newSearchParams);
    if (updatedUrl && updatedUrl !== url) {
      onUrlChange(updatedUrl);
    }
  };

  // Parse the current URL for display
  const parsedUrl = parseUrl(url);

  return (
    <section className="bg-elf-dark-blue/50 rounded-xl border border-elf-mid-blue/20 shadow-lg p-6">
      <label
        htmlFor="url-input"
        className="block text-sm font-medium text-elf-light-blue mb-2"
      >
        URL Input
      </label>
      
      <div className="relative">
        <input
          type="text"
          id="url-input"
          value={urlInput}
          onChange={(e) => handleUrlInputChange(e.target.value)}
          className={`
            font-mono w-full p-3 rounded-md text-lg border
            ${isValid 
              ? 'border-elf-mid-blue/30 bg-elf-dark-blue text-elf-light-blue focus:outline-none focus:ring-2 focus:ring-elf-yellow focus:border-transparent' 
              : 'border-elf-orange/50 bg-elf-orange/10 text-elf-orange focus:outline-none focus:ring-2 focus:ring-elf-orange focus:border-transparent'
            }
          `}
          placeholder="https://api.example.com/v1/users?token=..."
        />
        {!isValid && urlInput && (
          <div className="absolute top-full left-0 mt-1 text-sm text-elf-orange flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Invalid URL format
          </div>
        )}
      </div>

      {/* Only show URL components if the URL is valid */}
      {parsedUrl.isValid && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 space-y-3">
            <ProtocolEditor
              protocol={parsedUrl.protocol}
              isEditable={false}
            />
            <HostnameEditor
              hostname={parsedUrl.hostname}
              isEditable={false}
            />
            <PathEditor
              pathname={parsedUrl.pathname}
              isEditable={false}
            />
            <FragmentEditor
              hash={parsedUrl.hash}
              isEditable={false}
            />
          </div>
          
          <QueryParamEditor
            searchParams={parsedUrl.searchParams}
            onSearchParamsChange={handleSearchParamsChange}
          />
        </div>
      )}

      {/* Show helpful message for empty or invalid URLs */}
      {!parsedUrl.isValid && urlInput && (
        <div className="mt-6 text-center text-elf-light-blue/60 py-8">
          <p>Enter a valid URL to see its components</p>
          <p className="text-sm text-elf-light-blue/40 mt-1">
            Example: https://api.example.com/users?page=1#section
          </p>
        </div>
      )}

      {!urlInput && (
        <div className="mt-6 text-center text-elf-light-blue/40 py-8">
          <p>Paste or type a URL above to analyze its components</p>
        </div>
      )}
    </section>
  );
}