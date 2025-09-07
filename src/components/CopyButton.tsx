'use client';

import { useState } from 'react';

interface CopyButtonProps {
  textToCopy: string | (() => string);
  children?: React.ReactNode;
  className?: string;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function CopyButton({ 
  textToCopy, 
  children, 
  className = '', 
  title = 'Copy to clipboard',
  size = 'md'
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const text = typeof textToCopy === 'function' ? textToCopy() : textToCopy;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const sizeClasses = {
    sm: 'p-1',
    md: 'p-2', 
    lg: 'p-3'
  };

  const iconSizes = {
    sm: '14',
    md: '16',
    lg: '20'
  };

  const iconSize = iconSizes[size];

  const baseClasses = `
    ${sizeClasses[size]}
    rounded-md 
    transition-colors
    focus:outline-none 
    focus:ring-2 
    focus:ring-elf-yellow
    ${className || 'text-elf-light-blue/60 hover:text-elf-light-blue hover:bg-elf-mid-blue/20'}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      onClick={handleCopy}
      className={baseClasses}
      title={copied ? 'Copied!' : title}
      type="button"
    >
      {children || (
        copied ? (
          // Check icon for success state
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={iconSize}
            height={iconSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-green-600"
          >
            <polyline points="20,6 9,17 4,12" />
          </svg>
        ) : (
          // Copy icon for default state
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={iconSize}
            height={iconSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )
      )}
    </button>
  );
}