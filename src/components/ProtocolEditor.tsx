'use client';

import { useState } from 'react';

interface ProtocolEditorProps {
  protocol: string;
  onProtocolChange?: (newProtocol: string) => void;
  isEditable?: boolean;
}

const COMMON_PROTOCOLS = [
  'https:',
  'http:',
  'ftp:', 
  'ftps:',
  'ssh:',
  'file:',
];

export default function ProtocolEditor({ 
  protocol, 
  onProtocolChange, 
  isEditable = false 
}: ProtocolEditorProps) {
  const [isCustom, setIsCustom] = useState(
    !COMMON_PROTOCOLS.includes(protocol) && protocol !== ''
  );

  const handleProtocolSelect = (selectedProtocol: string) => {
    if (selectedProtocol === 'custom') {
      setIsCustom(true);
      return;
    }
    setIsCustom(false);
    onProtocolChange?.(selectedProtocol);
  };

  const handleCustomProtocolChange = (customProtocol: string) => {
    // Ensure it ends with ':' for valid protocol format
    const formattedProtocol = customProtocol.endsWith(':') 
      ? customProtocol 
      : customProtocol ? `${customProtocol}:` : '';
    onProtocolChange?.(formattedProtocol);
  };

  if (!isEditable || !onProtocolChange) {
    return (
      <div>
        <label className="block text-xs text-elf-light-blue uppercase tracking-wide">
          Scheme
        </label>
        <div className="font-mono bg-elf-mid-blue/10 border border-elf-mid-blue/20 p-2 rounded mt-1 text-elf-light-blue min-h-[40px] flex items-center">
          {protocol || <span className="text-elf-light-blue/50 italic">Not set</span>}
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-xs text-elf-light-blue uppercase tracking-wide">
        Scheme
      </label>
      
      {isCustom ? (
        <div className="flex gap-1 mt-1">
          <input
            type="text"
            value={protocol.replace(':', '')}
            onChange={(e) => handleCustomProtocolChange(e.target.value)}
            className="font-mono flex-1 p-2 rounded border border-elf-mid-blue/30 bg-elf-dark-blue text-elf-light-blue focus:outline-none focus:ring-2 focus:ring-elf-yellow focus:border-transparent"
            placeholder="custom"
          />
          <button
            onClick={() => handleProtocolSelect('https:')}
            className="px-2 py-1 text-xs bg-elf-mid-blue/20 text-elf-light-blue rounded hover:bg-elf-mid-blue/30 transition-colors"
            title="Switch to dropdown"
          >
            ↓
          </button>
        </div>
      ) : (
        <div className="flex gap-1 mt-1">
          <select
            value={protocol}
            onChange={(e) => handleProtocolSelect(e.target.value)}
            className="font-mono flex-1 p-2 rounded border border-elf-mid-blue/30 bg-elf-dark-blue text-elf-light-blue focus:outline-none focus:ring-2 focus:ring-elf-yellow focus:border-transparent"
          >
            {protocol && !COMMON_PROTOCOLS.includes(protocol) && (
              <option value={protocol}>{protocol}</option>
            )}
            {COMMON_PROTOCOLS.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
            <option value="custom">Custom...</option>
          </select>
        </div>
      )}
      
      {/* Protocol hint */}
      <div className="text-xs text-elf-light-blue/60 mt-1">
        {protocol === 'https:' && '🔒 Secure'}
        {protocol === 'http:' && '⚠️ Unsecure'}
        {protocol === 'ftp:' && '📁 File transfer'}
        {protocol === 'ssh:' && '🔐 Secure shell'}
      </div>
    </div>
  );
}