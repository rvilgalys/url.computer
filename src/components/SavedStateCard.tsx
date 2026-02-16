"use client";

import { useState, useRef, useEffect } from "react";
import { SavedState } from "../types";

interface SavedStateCardProps {
  savedState: SavedState;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
}

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-green-600/20 text-green-400",
  POST: "bg-blue-600/20 text-blue-400",
  PUT: "bg-yellow-600/20 text-yellow-400",
  PATCH: "bg-orange-600/20 text-orange-400",
  DELETE: "bg-red-600/20 text-red-400",
  HEAD: "bg-purple-600/20 text-purple-400",
};

export default function SavedStateCard({
  savedState,
  onLoad,
  onDelete,
  onRename,
}: SavedStateCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(savedState.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setEditValue(savedState.name);
    setIsEditing(true);
  };

  const handleFinishEdit = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== savedState.name) {
      onRename(savedState.id, trimmed);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleFinishEdit();
    } else if (e.key === "Escape") {
      setEditValue(savedState.name);
      setIsEditing(false);
    }
  };

  // Truncate URL for display
  let displayUrl = savedState.url;
  try {
    const parsed = new URL(savedState.url);
    displayUrl = parsed.hostname + parsed.pathname + parsed.search;
  } catch {
    // use raw url
  }

  const methodColor =
    METHOD_COLORS[savedState.curl.method] || "bg-gray-600/20 text-gray-400";

  return (
    <div className="group px-3 py-2.5 rounded-lg border border-elf-mid-blue/20 bg-elf-dark-blue/60 hover:border-elf-mid-blue/40 transition-colors">
      {/* Top row: method badge + title */}
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wide ${methodColor}`}
        >
          {savedState.curl.method}
        </span>

        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleFinishEdit}
            onKeyDown={handleKeyDown}
            className="flex-1 min-w-0 bg-elf-mid-blue/20 text-elf-light-blue text-sm rounded px-1.5 py-0.5 outline-none border border-elf-mid-blue/40 focus:border-elf-yellow"
            aria-label="Edit saved state name"
          />
        ) : (
          <button
            onClick={handleStartEdit}
            className="flex-1 min-w-0 text-left text-sm text-elf-light-blue truncate hover:text-elf-yellow transition-colors cursor-text"
            title="Click to rename"
            aria-label="Saved state name"
          >
            {savedState.name}
          </button>
        )}
      </div>

      {/* URL preview */}
      <p className="text-[11px] text-elf-light-blue/40 font-mono truncate mt-1 ml-[38px]">
        {displayUrl}
      </p>

      {/* Action buttons */}
      <div className="flex justify-end gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Load button */}
        <button
          onClick={() => onLoad(savedState.id)}
          className="p-1 rounded text-elf-mid-blue hover:text-elf-yellow hover:bg-elf-mid-blue/10 transition-colors"
          title="Load this state"
          aria-label="Load saved state"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
        </button>

        {/* Delete button */}
        <button
          onClick={() => onDelete(savedState.id)}
          className="p-1 rounded text-elf-mid-blue hover:text-red-400 hover:bg-red-400/10 transition-colors"
          title="Delete this state"
          aria-label="Delete saved state"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
