"use client";

import { useEffect } from "react";
import { useUrlState } from "../../hooks/useUrlState";
import URLAnalyzer from "../../components/URLAnalyzer";
import CurlBuilder from "../../components/CurlBuilder";
import CopyButton from "../../components/CopyButton";
import { CurlOptions } from "../../types";

export default function Home() {
  const [state, setState] = useUrlState();

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
      return window.location.href; // This includes the current hash with state
    }
    return ""; // Fallback for SSR
  };

  return (
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
      </header>

      <main className="space-y-6">
        <URLAnalyzer url={state.url} onUrlChange={handleUrlChange} />
        <CurlBuilder
          url={state.url}
          curlState={state.curl}
          onCurlChange={handleCurlChange}
        />
      </main>
    </div>
  );
}
