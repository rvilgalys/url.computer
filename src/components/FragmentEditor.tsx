'use client';

import CopyButton from './CopyButton';

interface FragmentEditorProps {
  hash: string;
  onHashChange?: (newHash: string) => void;
  isEditable?: boolean;
}

export default function FragmentEditor({ 
  hash, 
  onHashChange, 
  isEditable = false 
}: FragmentEditorProps) {
  if (!hash) return null; // Don't render if no fragment

  const fragmentValue = hash.startsWith('#') ? hash.slice(1) : hash;
  const displayHash = hash.startsWith('#') ? hash : `#${hash}`;
  
  // Detect common fragment patterns
  const isAnchorLink = /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(fragmentValue);
  const isScrollTo = fragmentValue.includes('scroll') || fragmentValue.includes('top');
  const isStateFragment = fragmentValue.includes('=') || fragmentValue.includes('&');
  const isNumericAnchor = /^\d+$/.test(fragmentValue);

  if (!isEditable || !onHashChange) {
    return (
      <div>
        <label className="block text-xs text-elf-light-blue uppercase tracking-wide">
          Fragment
        </label>
        <div className="font-mono bg-elf-mid-blue/10 border border-elf-mid-blue/20 p-2 rounded mt-1 text-elf-light-blue min-h-[40px] flex items-center justify-between">
          <div className="flex-1">
            <span className="text-elf-yellow">#</span>
            <span className="text-elf-light-blue">{fragmentValue}</span>
          </div>
          <CopyButton 
            textToCopy={displayHash} 
            size="sm" 
            className="ml-2 text-elf-light-blue/60 hover:text-elf-light-blue hover:bg-elf-mid-blue/20"
          />
        </div>
        
        {/* Fragment type indicator */}
        <div className="text-xs text-elf-light-blue/60 mt-1">
          {isAnchorLink && '⚓ Anchor link'}
          {isScrollTo && '📜 Scroll position'}
          {isStateFragment && '💾 State data'}
          {isNumericAnchor && '🔢 Numeric anchor'}
          {!isAnchorLink && !isScrollTo && !isStateFragment && !isNumericAnchor && '📌 Fragment'}
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-xs text-elf-light-blue uppercase tracking-wide">
        Fragment
      </label>
      <div className="flex gap-1 mt-1">
        <div className="flex items-center">
          <span className="font-mono text-elf-yellow bg-elf-mid-blue/10 border border-elf-mid-blue/20 border-r-0 rounded-l px-2 py-2">#</span>
          <input
            type="text"
            value={fragmentValue}
            onChange={(e) => {
              const newFragment = e.target.value;
              // Always include the # prefix
              onHashChange(newFragment ? `#${newFragment}` : '');
            }}
            className="font-mono flex-1 p-2 rounded-r border border-elf-mid-blue/30 border-l-0 bg-elf-dark-blue text-elf-light-blue focus:outline-none focus:ring-2 focus:ring-elf-yellow focus:border-transparent"
            placeholder="section-name"
          />
        </div>
        <CopyButton 
          textToCopy={displayHash} 
          size="sm" 
          className="text-elf-light-blue/60 hover:text-elf-light-blue hover:bg-elf-mid-blue/20"
        />
      </div>
      
      {/* Fragment type indicator */}
      {fragmentValue && (
        <div className="text-xs text-elf-light-blue/60 mt-1">
          {isAnchorLink && '⚓ Anchor link'}
          {isScrollTo && '📜 Scroll position'}
          {isStateFragment && '💾 State data'}
          {isNumericAnchor && '🔢 Numeric anchor'}
          {!isAnchorLink && !isScrollTo && !isStateFragment && !isNumericAnchor && '📌 Fragment'}
        </div>
      )}
      
      {/* Usage hint */}
      <div className="text-xs text-elf-light-blue/40 mt-1">
        Links to specific sections or elements on the page
      </div>
    </div>
  );
}