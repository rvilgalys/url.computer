import React, { useState, useEffect } from "react";
import { generateCurlCommand } from "../lib/curl";
import { recipes, Recipe } from "../lib/curlRecipes";
import { CurlOptions } from "../types";
import CopyButton from "./CopyButton";
import HeadersEditor from "./HeadersEditor";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface CurlBuilderProps {
  url: string;
  curlState: CurlOptions;
  onCurlChange: (newState: CurlOptions) => void;
}

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

export default function CurlBuilder({
  url,
  curlState,
  onCurlChange,
}: CurlBuilderProps) {
  const [command, setCommand] = useState("");
  const [forceShowBody, setForceShowBody] = useState(false);
  // Default to multi-line (singleLine = false)
  const [isSingleLine, setIsSingleLine] = useLocalStorage<boolean>(
    "curl-single-line",
    false
  );

  useEffect(() => {
    setCommand(generateCurlCommand(url, curlState, !isSingleLine));
  }, [url, curlState, isSingleLine]);

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onCurlChange({ ...curlState, method: e.target.value });
  };

  const handleReset = () => {
    onCurlChange({
      method: "GET",
      headers: {},
      body: "",
      options: [],
    });
  };

  const applyRecipe = (recipe: Recipe) => {
    if (recipe.isActive(curlState)) {
      onCurlChange(recipe.undo(curlState));
    } else {
      onCurlChange(recipe.action(curlState));
    }
  };

  const handleHeadersChange = (newHeaders: Record<string, string>) => {
    onCurlChange({ ...curlState, headers: newHeaders });
  };

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onCurlChange({ ...curlState, body: e.target.value });
  };

  // Simple syntax highlighting
  const renderHighlightedCommand = (cmd: string) => {
    // This is a very basic highlighter. For production, a library like prismjs would be better.
    // But we want to keep it lightweight as per requirements.
    const parts = cmd.split(" ");
    return parts.map((part, index) => {
      let className = "text-white";
      if (part === "curl") className = "text-elf-orange";
      else if (part.startsWith("-")) className = "text-elf-yellow";
      else if (part.startsWith("'") || part.startsWith('"'))
        className = "text-elf-light-blue";

      return (
        <span key={index} className={className}>
          {part}{" "}
        </span>
      );
    });
  };

  const showBodyEditor =
    ["POST", "PUT", "PATCH", "DELETE"].includes(curlState.method) ||
    curlState.body.length > 0 ||
    forceShowBody;

  const handleAddBody = () => {
    setForceShowBody(true);
  };

  const handleRemoveBody = () => {
    onCurlChange({ ...curlState, body: "" });
    setForceShowBody(false);
  };

  return (
    <section className="bg-elf-dark-blue/50 rounded-xl border border-elf-mid-blue/20 shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-elf-light-blue">
          cURL Builder
        </h2>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-elf-light-blue/80 cursor-pointer select-none group">
            <div
              className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                isSingleLine
                  ? "bg-elf-yellow border-elf-yellow"
                  : "bg-elf-dark-blue border-elf-mid-blue/30 group-hover:border-elf-mid-blue/60"
              }`}
            >
              {isSingleLine && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#023047"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
            </div>
            <input
              type="checkbox"
              checked={isSingleLine}
              onChange={(e) => setIsSingleLine(e.target.checked)}
              className="hidden"
            />
            Single Line
          </label>
          <div className="h-4 w-px bg-elf-mid-blue/30" />
          <CopyButton
            textToCopy={() => command}
            className="text-elf-light-blue/60 hover:text-elf-light-blue hover:bg-elf-mid-blue/20"
            title="Copy Command"
            size="sm"
          />
          <button
            onClick={handleReset}
            className="text-sm text-elf-light-blue/60 hover:text-elf-light-blue transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="relative bg-elf-dark-blue rounded-md p-4 font-mono text-white border border-elf-mid-blue/30 mb-6 overflow-x-auto">
        <pre className="whitespace-pre-wrap break-all">
          <code>{renderHighlightedCommand(command)}</code>
        </pre>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex flex-col">
          <label className="text-xs text-elf-light-blue uppercase mb-1">
            Method
          </label>
          <select
            value={curlState.method}
            onChange={handleMethodChange}
            className="bg-elf-dark-blue border border-elf-mid-blue text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-elf-yellow"
          >
            {METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col flex-1">
          <label className="text-xs text-elf-light-blue uppercase mb-1">
            Recipes
          </label>
          <div className="flex flex-wrap gap-2">
            {recipes.map((recipe) => {
              const isActive = recipe.isActive(curlState);
              return (
                <button
                  key={recipe.label}
                  onClick={() => applyRecipe(recipe)}
                  className={`px-3 py-1 rounded-full text-sm transition-transform hover:-translate-y-0.5 shadow-sm hover:shadow-md font-medium border border-elf-mid-blue/30 ${
                    isActive
                      ? "bg-elf-yellow text-elf-dark-blue"
                      : "bg-elf-mid-blue/20 hover:bg-elf-mid-blue/40 text-elf-light-blue hover:text-white"
                  }`}
                >
                  {recipe.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <HeadersEditor
        headers={curlState.headers}
        onHeadersChange={handleHeadersChange}
      />

      {showBodyEditor ? (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs text-elf-light-blue uppercase tracking-wide">
              Request Body
            </h3>
            <button
              onClick={handleRemoveBody}
              className="p-1.5 rounded-md text-elf-light-blue/60 hover:bg-elf-orange/20 hover:text-elf-orange transition-colors"
              title="Remove Body"
              type="button"
            >
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
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <textarea
            value={curlState.body}
            onChange={handleBodyChange}
            className="w-full h-32 bg-elf-dark-blue rounded-md p-4 font-mono text-white border border-elf-mid-blue/30 focus:outline-none focus:ring-2 focus:ring-elf-yellow focus:border-transparent text-sm md:text-base resize-y"
            placeholder='{ "key": "value" }'
            spellCheck={false}
          />
        </div>
      ) : (
        <div className="mt-6">
          <button
            onClick={handleAddBody}
            className="text-xs flex items-center gap-1 text-elf-light-blue/80 hover:text-elf-light-blue bg-elf-mid-blue/10 hover:bg-elf-mid-blue/20 px-3 py-2 rounded transition-colors border border-elf-mid-blue/20"
          >
            <span className="text-lg leading-none">+</span> Add Body
          </button>
        </div>
      )}
    </section>
  );
}
