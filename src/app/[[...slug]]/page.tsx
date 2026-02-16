"use client";

import { useEffect, useState } from "react";
import { useUrlState } from "../../hooks/useUrlState";
import { useSavedStates } from "../../hooks/useSavedStates";
import URLAnalyzer from "../../components/URLAnalyzer";
import CurlBuilder from "../../components/CurlBuilder";
import CopyButton from "../../components/CopyButton";
import SavedStatesSidebar from "../../components/SavedStatesSidebar";
import { CurlOptions } from "../../types";

export default function Home() {
  const [state, setState] = useUrlState();
  const { savedStates, saveState, deleteState, renameState, getState } =
    useSavedStates();
  const [saveFlash, setSaveFlash] = useState(false);

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
          </div>

          <div className="flex items-center gap-3">
            {/* Save to Local Storage button */}
            <button
              onClick={handleSaveToLocalStorage}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-md ${
                saveFlash
                  ? "bg-green-600 text-white"
                  : "bg-elf-mid-blue/30 text-elf-light-blue border border-elf-mid-blue/40 hover:bg-elf-mid-blue/50 hover:border-elf-mid-blue/60"
              }`}
              title="Save current state to local storage"
            >
              {saveFlash ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
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
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              )}
              <span className="text-sm font-medium">
                {saveFlash ? "Saved!" : "Save to Local Storage"}
              </span>
            </button>

            {/* Copy Shareable Link button */}
            <div className="flex items-center gap-2 px-4 py-2 bg-elf-mid-blue text-white rounded-lg hover:bg-elf-mid-blue/80 transition-colors shadow-md">
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
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72" />
              </svg>
              <CopyButton
                textToCopy={getShareableLink}
                className="text-white hover:text-elf-light-blue"
              >
                <span>Copy Shareable Link</span>
              </CopyButton>
            </div>
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
    </>
  );
}
