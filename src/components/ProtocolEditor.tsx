"use client";

import { useState } from "react";

interface ProtocolEditorProps {
  protocol: string;
  onProtocolChange?: (newProtocol: string) => void;
  isEditable?: boolean;
}

const COMMON_PROTOCOLS = [
  // Web protocols
  "http:",
  "https:",
  "ws:",
  "wss:",
  "ssh:",

  // File transfer protocols
  "ftp:",
  "ftps:",
  "sftp:",
  "scp:",
  "tftp:",
  "file:",

  // Email protocols
  "smtp:",
  "smtps:",
  "pop3:",
  "pop3s:",
  "imap:",
  "imaps:",

  // Directory protocols
  "ldap:",
  "ldaps:",

  // Media streaming protocols
  "rtmp:",
  "rtmps:",
  "rtsp:",

  // File system protocols
  "smb:",
  "smbs:",

  // Other protocols
  "dict:",
  "gopher:",
  "gophers:",
  "mqtt:",
  "telnet:",
];

export default function ProtocolEditor({
  protocol,
  onProtocolChange,
  isEditable = false,
}: ProtocolEditorProps) {
  const [isCustom, setIsCustom] = useState(
    !COMMON_PROTOCOLS.includes(protocol) && protocol !== "",
  );

  const handleProtocolSelect = (selectedProtocol: string) => {
    if (selectedProtocol === "custom") {
      setIsCustom(true);
      return;
    }
    setIsCustom(false);
    onProtocolChange?.(selectedProtocol);
  };

  const handleCustomProtocolChange = (customProtocol: string) => {
    // Ensure it ends with ':' for valid protocol format
    const formattedProtocol = customProtocol.endsWith(":")
      ? customProtocol
      : customProtocol
        ? `${customProtocol}:`
        : "";
    onProtocolChange?.(formattedProtocol);
  };

  if (!isEditable || !onProtocolChange) {
    return (
      <div>
        <label className="block text-xs text-elf-light-blue uppercase tracking-wide">
          Scheme
        </label>
        <div className="font-mono bg-elf-mid-blue/10 border border-elf-mid-blue/20 p-2 rounded mt-1 text-elf-light-blue min-h-[40px] flex items-center">
          {protocol || (
            <span className="text-elf-light-blue/50 italic">Not set</span>
          )}
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
            value={protocol.replace(":", "")}
            onChange={(e) => handleCustomProtocolChange(e.target.value)}
            className="font-mono flex-1 p-2 rounded border border-elf-mid-blue/30 bg-elf-dark-blue text-elf-light-blue focus:outline-none focus:ring-2 focus:ring-elf-yellow focus:border-transparent"
            placeholder="custom"
          />
          <button
            onClick={() => handleProtocolSelect("https:")}
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
            {COMMON_PROTOCOLS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
            <option value="custom">Custom...</option>
          </select>
        </div>
      )}

      {/* Protocol hint */}
      <div className="text-xs text-elf-light-blue/60 mt-1">
        {/* Web protocols */}
        {protocol === "http:" && "⚠️ Unsecure web"}
        {protocol === "https:" && "🔒 Secure web"}
        {protocol === "ws:" && "🔌 WebSocket"}
        {protocol === "wss:" && "🔒 Secure WebSocket"}
        {protocol === "ssh:" && "🔒 Secure Shell"}

        {/* File transfer protocols */}
        {protocol === "ftp:" && "📁 File transfer"}
        {protocol === "ftps:" && "🔒 Secure file transfer"}
        {protocol === "sftp:" && "🔐 SSH file transfer"}
        {protocol === "scp:" && "🔐 SSH copy"}
        {protocol === "tftp:" && "📤 Trivial file transfer"}
        {protocol === "file:" && "📄 Local file"}

        {/* Email protocols */}
        {protocol === "smtp:" && "📧 Send mail"}
        {protocol === "smtps:" && "🔒 Secure send mail"}
        {protocol === "pop3:" && "📥 Receive mail"}
        {protocol === "pop3s:" && "🔒 Secure receive mail"}
        {protocol === "imap:" && "📬 Mail access"}
        {protocol === "imaps:" && "🔒 Secure mail access"}

        {/* Directory protocols */}
        {protocol === "ldap:" && "📋 Directory"}
        {protocol === "ldaps:" && "🔒 Secure directory"}

        {/* Media streaming protocols */}
        {protocol === "rtmp:" && "🎥 Media stream"}
        {protocol === "rtmps:" && "🔒 Secure media stream"}
        {protocol === "rtsp:" && "📺 Real-time stream"}

        {/* File system protocols */}
        {protocol === "smb:" && "🗂️ Network share"}
        {protocol === "smbs:" && "🔒 Secure network share"}

        {/* Other protocols */}
        {protocol === "dict:" && "📖 Dictionary"}
        {protocol === "gopher:" && "🕳️ Gopher protocol"}
        {protocol === "gophers:" && "🔒 Secure Gopher"}
        {protocol === "mqtt:" && "🔄 IoT messaging"}
        {protocol === "telnet:" && "💻 Remote terminal"}

        {/* Custom protocol */}
        {protocol && !COMMON_PROTOCOLS.includes(protocol) && "⚙️ Custom scheme"}
      </div>
    </div>
  );
}
