'use client';

import { useState, useEffect } from 'react';
import CopyButton from './CopyButton';
import { validateHostname } from '../lib/url';

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
  const [localHostname, setLocalHostname] = useState(hostname);
  const [validationState, setValidationState] = useState<{ isValid: boolean; error?: string }>({ isValid: true });

  // Update local state when prop changes
  useEffect(() => {
    setLocalHostname(hostname);
    setValidationState({ isValid: true });
  }, [hostname]);

  // Handle hostname changes with validation
  const handleHostnameChange = (newHostname: string) => {
    setLocalHostname(newHostname);
    
    if (!newHostname) {
      setValidationState({ isValid: true });
      return;
    }

    const validation = validateHostname(newHostname);
    setValidationState(validation);

    // Only propagate valid hostnames to parent
    if (validation.isValid && onHostnameChange) {
      onHostnameChange(newHostname);
    }
  };

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
      <div className="relative">
        <div className="flex gap-1 mt-1">
          <input
            type="text"
            value={localHostname}
            onChange={(e) => handleHostnameChange(e.target.value)}
            className={`
              font-mono flex-1 p-2 rounded border
              ${!validationState.isValid 
                ? 'border-elf-orange/50 bg-elf-orange/10 text-elf-orange focus:outline-none focus:ring-2 focus:ring-elf-orange focus:border-transparent'
                : 'border-elf-mid-blue/30 bg-elf-dark-blue text-elf-light-blue focus:outline-none focus:ring-2 focus:ring-elf-yellow focus:border-transparent'
              }
            `}
            placeholder="example.com"
          />
          {localHostname && validationState.isValid && (
            <CopyButton 
              textToCopy={localHostname} 
              size="sm" 
              className="text-elf-light-blue/60 hover:text-elf-light-blue hover:bg-elf-mid-blue/20"
            />
          )}
        </div>
        
        {/* Error message */}
        {!validationState.isValid && localHostname && (
          <div className="absolute top-full left-0 mt-1 text-sm text-elf-orange flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {validationState.error}
          </div>
        )}
      </div>
      
      {/* Host type indicator */}
      {localHostname && validationState.isValid && (
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