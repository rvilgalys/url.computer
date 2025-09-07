'use client';

import CopyButton from './CopyButton';

interface HostnameEditorProps {
  hostname: string;
  onHostnameChange?: (newHostname: string) => void;
  isEditable?: boolean;
}

export default function HostnameEditor({ 
  hostname, 
  onHostnameChange, 
  isEditable = false 
}: HostnameEditorProps) {
  // Extract subdomain and domain for visual highlighting
  const getHostnameParts = (host: string) => {
    if (!host) return { subdomain: '', domain: '' };
    
    const parts = host.split('.');
    if (parts.length <= 2) {
      return { subdomain: '', domain: host };
    }
    
    // Assume last two parts are domain (e.g., example.com)
    const domain = parts.slice(-2).join('.');
    const subdomain = parts.slice(0, -2).join('.');
    
    return { subdomain, domain };
  };

  const { subdomain, domain } = getHostnameParts(hostname);
  
  const isLocalhost = hostname === 'localhost' || hostname.startsWith('127.') || hostname.startsWith('192.168.') || hostname.startsWith('10.');
  const isIP = /^\d+\.\d+\.\d+\.\d+$/.test(hostname);

  if (!isEditable || !onHostnameChange) {
    return (
      <div>
        <label className="block text-xs text-elf-light-blue uppercase tracking-wide">
          Host
        </label>
        <div className="font-mono bg-elf-mid-blue/10 border border-elf-mid-blue/20 p-2 rounded mt-1 text-elf-light-blue min-h-[40px] flex items-center justify-between">
          <div className="flex-1">
            {hostname ? (
              <div>
                {subdomain && (
                  <span className="text-elf-yellow">{subdomain}.</span>
                )}
                <span className="text-elf-light-blue">{domain || hostname}</span>
              </div>
            ) : (
              <span className="text-elf-light-blue/50 italic">Not set</span>
            )}
          </div>
          {hostname && (
            <CopyButton 
              textToCopy={hostname} 
              size="sm" 
              className="ml-2 text-elf-light-blue/60 hover:text-elf-light-blue hover:bg-elf-mid-blue/20"
            />
          )}
        </div>
        
        {/* Host type indicator */}
        {hostname && (
          <div className="text-xs text-elf-light-blue/60 mt-1">
            {isLocalhost && '🏠 Local development'}
            {isIP && !isLocalhost && '🌐 IP address'}
            {!isIP && !isLocalhost && subdomain && '📡 Subdomain'}
            {!isIP && !isLocalhost && !subdomain && '🌍 Domain'}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <label className="block text-xs text-elf-light-blue uppercase tracking-wide">
        Host
      </label>
      <div className="flex gap-1 mt-1">
        <input
          type="text"
          value={hostname}
          onChange={(e) => onHostnameChange(e.target.value)}
          className="font-mono flex-1 p-2 rounded border border-elf-mid-blue/30 bg-elf-dark-blue text-elf-light-blue focus:outline-none focus:ring-2 focus:ring-elf-yellow focus:border-transparent"
          placeholder="example.com"
        />
        {hostname && (
          <CopyButton 
            textToCopy={hostname} 
            size="sm" 
            className="text-elf-light-blue/60 hover:text-elf-light-blue hover:bg-elf-mid-blue/20"
          />
        )}
      </div>
      
      {/* Host type indicator */}
      {hostname && (
        <div className="text-xs text-elf-light-blue/60 mt-1">
          {isLocalhost && '🏠 Local development'}
          {isIP && !isLocalhost && '🌐 IP address'}
          {!isIP && !isLocalhost && subdomain && '📡 Subdomain'}
          {!isIP && !isLocalhost && !subdomain && '🌍 Domain'}
        </div>
      )}
    </div>
  );
}