'use client';

interface UrlComponentProps {
  label: string;
  value: string;
  placeholder?: string;
  isEditable?: boolean;
  onValueChange?: (newValue: string) => void;
}

function UrlComponent({ label, value, placeholder, isEditable = false, onValueChange }: UrlComponentProps) {
  if (isEditable && onValueChange) {
    return (
      <div>
        <label className="block text-xs text-gray-500 uppercase">
          {label}
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          className="font-mono w-full p-2 rounded mt-1 border border-gray-300 bg-gray-50 text-blue-900 focus:outline-2 focus:outline-yellow-500 focus:border-transparent"
          placeholder={placeholder}
        />
      </div>
    );
  }

  // Read-only display
  return (
    <div>
      <label className="block text-xs text-gray-500 uppercase">
        {label}
      </label>
      <div className="font-mono bg-gray-100 p-2 rounded mt-1 text-blue-900 min-h-[40px] flex items-center">
        {value || <span className="text-gray-400 italic">{placeholder || 'Not set'}</span>}
      </div>
    </div>
  );
}

interface UrlComponentsProps {
  protocol: string;
  hostname: string;
  pathname: string;
  hash: string;
  onProtocolChange?: (value: string) => void;
  onHostnameChange?: (value: string) => void;
  onPathnameChange?: (value: string) => void;
  onHashChange?: (value: string) => void;
}

export default function UrlComponents({
  protocol,
  hostname,
  pathname,
  hash,
  onProtocolChange,
  onHostnameChange,
  onPathnameChange,
  onHashChange,
}: UrlComponentsProps) {
  // For MVP, these are read-only as per the mock design
  // But we could make them editable later by passing the change handlers
  
  return (
    <div className="col-span-1 space-y-3">
      <UrlComponent
        label="Scheme"
        value={protocol}
        placeholder="https:"
        isEditable={false}
        onValueChange={onProtocolChange}
      />
      <UrlComponent
        label="Host"
        value={hostname}
        placeholder="example.com"
        isEditable={false}
        onValueChange={onHostnameChange}
      />
      <UrlComponent
        label="Path"
        value={pathname || '/'}
        placeholder="/path"
        isEditable={false}
        onValueChange={onPathnameChange}
      />
      {hash && (
        <UrlComponent
          label="Fragment"
          value={hash}
          placeholder="#section"
          isEditable={false}
          onValueChange={onHashChange}
        />
      )}
    </div>
  );
}