"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUrlState } from "../../hooks/useUrlState";
import { useSavedStates } from "../../hooks/useSavedStates";
import URLAnalyzer from "../../components/URLAnalyzer";
import CurlBuilder from "../../components/CurlBuilder";
import SavedStatesSidebar from "../../components/SavedStatesSidebar";
import Footer from "../../components/Footer";
import { CurlOptions } from "../../types";

export default function Home() {
  const [state, setState] = useUrlState();
  const { savedStates, saveState, deleteState, renameState, getState } =
    useSavedStates();
  const [saveFlash, setSaveFlash] = useState(false);
  const [copyFlash, setCopyFlash] = useState(false);

  // Update document title based on current URL and cURL method
  useEffect(() => {
    let hostname = "";
    try {
      const parsedUrl = new URL(state.url);
      hostname = parsedUrl.hostname;
    } catch {
      // Invalid URL, use a fallback
      hostname = state.url.split("/")[0] || "";
    }

    if (hostname) {
      document.title = `url.computer ✦ ${hostname} ✦ ${state.curl.method}`;
    } else {
      document.title = "url.computer";
    }
  }, [state.url, state.curl.method]);

  const handleUrlChange = (newUrl: string) => {
    setState((prev) => ({
      ...prev,
      url: newUrl,
    }));
  };

  const handleCurlChange = (newCurlState: CurlOptions) => {
    setState((prev) => ({
      ...prev,
      curl: newCurlState,
    }));
  };

  const getShareableLink = () => {
    if (typeof window !== "undefined") {
      return window.location.href;
    }
    return "";
  };

  const handleCopyShareableLink = async () => {
    try {
      const link = getShareableLink();
      await navigator.clipboard.writeText(link);
      setCopyFlash(true);
      setTimeout(() => setCopyFlash(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleSaveToLocalStorage = () => {
    saveState(state.url, state.curl);
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 2000);
  };

  const handleLoadState = (id: string) => {
    const loaded = getState(id);
    if (loaded) {
      setState({
        url: loaded.url,
        curl: loaded.curl,
      });
    }
  };

  return (
    <>
      <SavedStatesSidebar
        savedStates={savedStates}
        onLoad={handleLoadState}
        onDelete={deleteState}
        onRename={renameState}
      />

      <div className="container mx-auto p-4 md:p-8 max-w-5xl">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 8L10 12L6 16"
                stroke="#8ecae6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 16H18"
                stroke="#ffb703"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <h1 className="text-3xl font-bold text-elf-light-blue font-mono">
              url.computer
            </h1>
            <span className="text-elf-light-blue/20 hidden sm:inline">|</span>
            <nav className="hidden sm:flex items-center gap-3">
              <Link
                href="/docs"
                className="text-elf-light-blue/50 hover:text-elf-light-blue font-mono text-sm transition-colors"
              >
                docs
              </Link>
              <Link
                href="/about"
                className="text-elf-light-blue/50 hover:text-elf-light-blue font-mono text-sm transition-colors"
              >
                about
              </Link>
            </nav>
          </div>

          <div className="flex flex-col items-end gap-0.5">
            {/* Copy Shareable Link button */}
            <button
              onClick={handleCopyShareableLink}
              className={`flex items-center gap-2 px-2 py-1.5 rounded font-mono text-xs transition-colors ${
                copyFlash
                  ? "text-green-400"
                  : "text-elf-light-blue/50 hover:text-elf-light-blue hover:bg-elf-mid-blue/15"
              }`}
              title="Copy shareable link to clipboard"
            >
              {copyFlash ? "copied!" : "copy shareable link"}
              {copyFlash ? (
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
                  <polyline points="20,6 9,17 4,12" />
                </svg>
              ) : (
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
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72" />
                </svg>
              )}
            </button>

            {/* Save to localStorage button */}
            <button
              onClick={handleSaveToLocalStorage}
              className={`flex items-center gap-2 px-2 py-1.5 rounded font-mono text-xs transition-colors ${
                saveFlash
                  ? "text-green-400"
                  : "text-elf-light-blue/50 hover:text-elf-light-blue hover:bg-elf-mid-blue/15"
              }`}
              title="Save current state to localStorage"
            >
              {saveFlash ? "saved!" : "save to localStorage"}
              {saveFlash ? (
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
                  <polyline points="20,6 9,17 4,12" />
                </svg>
              ) : (
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
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
              )}
            </button>
          </div>
        </header>

        <main className="space-y-6">
          <URLAnalyzer url={state.url} onUrlChange={handleUrlChange} />
          <CurlBuilder
            url={state.url}
            curlState={state.curl}
            onCurlChange={handleCurlChange}
            onUrlChange={handleUrlChange}
          />
        </main>
      </div>

      <Footer />
    </>
  );
}
