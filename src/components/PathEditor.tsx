'use client';

import { useState, useEffect } from 'react';
import CopyButton from './CopyButton';
import { validatePathname } from '../lib/url';

interface PathEditorProps {
  pathname: string;
  onPathnameChange?: (newPathname: string) => void;
  isEditable?: boolean;
}

export default function PathEditor({ 
  pathname, 
  onPathnameChange, 
  isEditable = false 
}: PathEditorProps) {
  const [localPathname, setLocalPathname] = useState(pathname);
  const [validationState, setValidationState] = useState<{ isValid: boolean; error?: string }>({ isValid: true });

  // Update local state when prop changes
  useEffect(() => {
    setLocalPathname(pathname);
    setValidationState({ isValid: true });
  }, [pathname]);

  // Handle pathname changes with validation
  const handlePathnameChange = (newPathname: string) => {
    setLocalPathname(newPathname);
    
    // Ensure path starts with / if not empty
    const formattedPath = newPathname && !newPathname.startsWith('/') 
      ? `/${newPathname}` 
      : newPathname;
    
    const validation = validatePathname(formattedPath);
    setValidationState(validation);

    // Only propagate valid pathnames to parent
    if (validation.isValid && onPathnameChange) {
      onPathnameChange(formattedPath);
    }
  };

  // Parse path segments for breadcrumb display
  const getPathSegments = (path: string) => {
    if (!path || path === '/') return [];
    return path.split('/').filter(segment => segment.length > 0);
  };

  const segments = getPathSegments(pathname);
  const displayPath = localPathname || '/';
  
  // Detect common API patterns
  const isAPIPath = pathname.includes('/api/') || pathname.includes('/v1/') || pathname.includes('/v2/');
  const hasFileExtension = /\.[a-zA-Z0-9]+$/.test(pathname);
  const isDynamicRoute = pathname.includes('[') && pathname.includes(']');

  if (!isEditable || !onPathnameChange) {
    return (
      <div>
        <label className="block text-xs text-elf-light-blue uppercase tracking-wide">
          Path
        </label>
        <div className="font-mono bg-elf-mid-blue/10 border border-elf-mid-blue/20 p-2 rounded mt-1 text-elf-light-blue min-h-[40px] flex items-center justify-between">
          <div className="flex-1">
            {segments.length > 0 ? (
              <div className="flex items-center flex-wrap gap-1">
                <span className="text-elf-light-blue/60">/</span>
                {segments.map((segment, index) => (
                  <div key={index} className="flex items-center">
                    <span className="text-elf-light-blue">{segment}</span>
                    {index < segments.length - 1 && (
                      <span className="text-elf-light-blue/60 mx-1">/</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-elf-light-blue">/</span>
            )}
          </div>
          {pathname && pathname !== '/' && (
            <CopyButton 
              textToCopy={pathname} 
              size="sm" 
              className="ml-2 text-elf-light-blue/60 hover:text-elf-light-blue hover:bg-elf-mid-blue/20"
            />
          )}
        </div>
        
        {/* Path type indicators */}
        {pathname && pathname !== '/' && (
          <div className="text-xs text-elf-light-blue/60 mt-1">
            {isAPIPath && '🔌 API endpoint'}
            {hasFileExtension && !isAPIPath && '📄 Static file'}
            {isDynamicRoute && '🔀 Dynamic route'}
            {!isAPIPath && !hasFileExtension && !isDynamicRoute && segments.length > 2 && '📁 Deep path'}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <label className="block text-xs text-elf-light-blue uppercase tracking-wide">
        Path
      </label>
      <div className="relative">
        <div className="flex gap-1 mt-1">
          <input
            type="text"
            value={displayPath}
            onChange={(e) => handlePathnameChange(e.target.value)}
            className={`
              font-mono flex-1 p-2 rounded border
              ${!validationState.isValid 
                ? 'border-elf-orange/50 bg-elf-orange/10 text-elf-orange focus:outline-none focus:ring-2 focus:ring-elf-orange focus:border-transparent'
                : 'border-elf-mid-blue/30 bg-elf-dark-blue text-elf-light-blue focus:outline-none focus:ring-2 focus:ring-elf-yellow focus:border-transparent'
              }
            `}
            placeholder="/path/to/resource"
          />
          {localPathname && localPathname !== '/' && validationState.isValid && (
            <CopyButton 
              textToCopy={localPathname} 
              size="sm" 
              className="text-elf-light-blue/60 hover:text-elf-light-blue hover:bg-elf-mid-blue/20"
            />
          )}
        </div>
        
        {/* Error message */}
        {!validationState.isValid && localPathname && (
          <div className="absolute top-full left-0 mt-1 text-sm text-elf-orange flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {validationState.error}
          </div>
        )}
      </div>
      
      {/* Breadcrumb display for complex paths */}
      {segments.length > 1 && validationState.isValid && (
        <div className="text-xs text-elf-light-blue/40 mt-1 flex items-center gap-1">
          <span>📍</span>
          {segments.map((segment, index) => (
            <span key={index}>
              {segment}
              {index < segments.length - 1 && ' → '}
            </span>
          ))}
        </div>
      )}
      
      {/* Path type indicators */}
      {localPathname && localPathname !== '/' && validationState.isValid && (
        <div className="text-xs text-elf-light-blue/60 mt-1">
          {isAPIPath && '🔌 API endpoint'}
          {hasFileExtension && !isAPIPath && '📄 Static file'}
          {isDynamicRoute && '🔀 Dynamic route'}
          {!isAPIPath && !hasFileExtension && !isDynamicRoute && segments.length > 2 && '📁 Deep path'}
        </div>
      )}
    </div>
  );
}