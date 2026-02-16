"use client";

import { useLocalStorage } from "../hooks/useLocalStorage";
import { SavedState } from "../types";
import SavedStateCard from "./SavedStateCard";

interface SavedStatesSidebarProps {
  savedStates: SavedState[];
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
}

export default function SavedStatesSidebar({
  savedStates,
  onLoad,
  onDelete,
  onRename,
}: SavedStatesSidebarProps) {
  const [isOpen, setIsOpen] = useLocalStorage("sidebar-open", false);

  return (
    <>
      {/* Toggle button — always visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-elf-dark-blue border border-elf-mid-blue/30 text-elf-light-blue hover:text-elf-yellow hover:border-elf-mid-blue/60 transition-colors shadow-lg"
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        title={isOpen ? "Close saved states" : "Open saved states"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {isOpen ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          ) : (
            <>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </>
          )}
        </svg>
      </button>

      {/* Sidebar panel */}
      <aside
        className={`fixed top-0 left-0 h-full z-40 bg-elf-dark-blue/95 backdrop-blur-sm border-r border-elf-mid-blue/20 shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: "280px" }}
        aria-label="Saved states sidebar"
      >
        <div className="flex flex-col h-full pt-16 px-3 pb-4">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4 px-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-elf-yellow shrink-0"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            <h2 className="text-sm font-semibold text-elf-light-blue">
              Saved States
            </h2>
            <span className="text-[10px] text-elf-light-blue/40 font-mono">
              ({savedStates.length})
            </span>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin">
            {savedStates.length === 0 ? (
              <div className="text-center py-8 px-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mx-auto mb-3 text-elf-mid-blue/40"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                <p className="text-sm text-elf-light-blue/40">
                  No saved states yet
                </p>
                <p className="text-[11px] text-elf-light-blue/25 mt-1">
                  Click &quot;Save to Local Storage&quot; to save your current
                  URL &amp; curl config
                </p>
              </div>
            ) : (
              savedStates.map((state) => (
                <SavedStateCard
                  key={state.id}
                  savedState={state}
                  onLoad={onLoad}
                  onDelete={onDelete}
                  onRename={onRename}
                />
              ))
            )}
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
