'use client';

import CopyButton from './CopyButton';

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
  // Parse path segments for breadcrumb display
  const getPathSegments = (path: string) => {
    if (!path || path === '/') return [];
    return path.split('/').filter(segment => segment.length > 0);
  };

  const segments = getPathSegments(pathname);
  const displayPath = pathname || '/';
  
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
      <div className="flex gap-1 mt-1">
        <input
          type="text"
          value={displayPath}
          onChange={(e) => {
            const newPath = e.target.value;
            // Ensure path starts with / if not empty
            const formattedPath = newPath && !newPath.startsWith('/') 
              ? `/${newPath}` 
              : newPath;
            onPathnameChange(formattedPath);
          }}
          className="font-mono flex-1 p-2 rounded border border-elf-mid-blue/30 bg-elf-dark-blue text-elf-light-blue focus:outline-none focus:ring-2 focus:ring-elf-yellow focus:border-transparent"
          placeholder="/path/to/resource"
        />
        {pathname && pathname !== '/' && (
          <CopyButton 
            textToCopy={pathname} 
            size="sm" 
            className="text-elf-light-blue/60 hover:text-elf-light-blue hover:bg-elf-mid-blue/20"
          />
        )}
      </div>
      
      {/* Breadcrumb display for complex paths */}
      {segments.length > 1 && (
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