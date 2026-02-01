import React, { useState, useEffect, useRef, useCallback } from "react";
import { generateCurlCommand, parseCurlCommand } from "../lib/curl";
import { recipes, Recipe } from "../lib/curlRecipes";
import { CurlOptions } from "../types";
import CopyButton from "./CopyButton";
import HeadersEditor from "./HeadersEditor";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface CurlBuilderProps {
  url: string;
  curlState: CurlOptions;
  onCurlChange: (newState: CurlOptions) => void;
  onUrlChange?: (newUrl: string) => void;
}

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

export default function CurlBuilder({
  url,
  curlState,
  onCurlChange,
  onUrlChange,
}: CurlBuilderProps) {
  // The generated command from state (source of truth when not editing)
  const [generatedCommand, setGeneratedCommand] = useState("");
  // The text in the editable textarea (may differ from generated during editing)
  const [editableText, setEditableText] = useState("");
  // Track if user is currently editing (dirty state)
  const [isEditing, setIsEditing] = useState(false);
  // Parse error message (null when valid)
  const [parseError, setParseError] = useState<string | null>(null);
  // Body editor visibility
  const [forceShowBody, setForceShowBody] = useState(false);
  // Default to multi-line (singleLine = false)
  const [isSingleLine, setIsSingleLine] = useLocalStorage<boolean>(
    "curl-single-line",
    false,
  );
  // Debounce timer ref
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Ref to track what we've already generated to detect external changes
  const lastGeneratedRef = useRef("");

  // Generate the command from state
  useEffect(() => {
    const cmd = generateCurlCommand(url, curlState, !isSingleLine);

    // Check if the state actually changed from outside vs just us updating it
    const isExternalChange = cmd !== lastGeneratedRef.current;

    setGeneratedCommand(cmd);
    lastGeneratedRef.current = cmd;

    // Only update editable text if not currently editing
    // OR if the state was updated from outside (e.g. parent changed the URL)
    if (!isEditing) {
      // Revert if no error OR if external state has moved on
      if (!parseError || isExternalChange) {
        setEditableText(cmd);
        if (isExternalChange) {
          setParseError(null);
        }
      }
    }
  }, [url, curlState, isSingleLine, isEditing, parseError]);

  // Parse the curl text and update state
  const parseAndApply = useCallback(
    (text: string) => {
      const result = parseCurlCommand(text);

      if (!result.isValid) {
        setParseError(result.error || "Invalid cURL command");
        return;
      }

      setParseError(null);

      // Update URL if changed and callback provided
      if (result.url && result.url !== url && onUrlChange) {
        onUrlChange(result.url);
      }

      // Check if curlOptions actually changed to avoid unnecessary updates
      const newOptions = result.curlOptions;
      const hasChanges =
        newOptions.method !== curlState.method ||
        newOptions.body !== curlState.body ||
        JSON.stringify(newOptions.headers) !==
          JSON.stringify(curlState.headers) ||
        JSON.stringify(newOptions.options) !==
          JSON.stringify(curlState.options);

      if (hasChanges) {
        onCurlChange(newOptions);
      }
    },
    [url, curlState, onCurlChange, onUrlChange],
  );

  // Handle textarea input changes
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setEditableText(newText);
    setIsEditing(true);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce parsing by 500ms
    debounceRef.current = setTimeout(() => {
      parseAndApply(newText);
    }, 500);
  };

  // Handle blur - finalize editing
  const handleTextBlur = () => {
    // Clear any pending debounce and parse immediately
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    parseAndApply(editableText);
    setIsEditing(false);
  };

  // Handle focus
  const handleTextFocus = () => {
    setIsEditing(true);
  };

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
    setParseError(null);
    setIsEditing(false);
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
            textToCopy={() => generatedCommand}
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

      {/* Editable curl command textarea */}
      <div className="relative mb-6">
        <textarea
          value={editableText}
          onChange={handleTextChange}
          onBlur={handleTextBlur}
          onFocus={handleTextFocus}
          className={`w-full bg-elf-dark-blue rounded-md p-4 font-mono text-white border transition-colors resize-y min-h-[80px] ${
            parseError
              ? "border-orange-500 focus:ring-orange-500"
              : "border-elf-mid-blue/30 focus:ring-elf-yellow"
          } focus:outline-none focus:ring-2 focus:border-transparent`}
          style={{
            fontFamily:
              "var(--font-jetbrains-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          }}
          placeholder="curl 'https://example.com'"
          spellCheck={false}
          rows={isSingleLine ? 2 : 4}
        />
        {parseError && (
          <div className="mt-2 flex items-center gap-2 text-orange-400 text-sm">
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
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{parseError}</span>
          </div>
        )}
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
            <div className="flex items-center gap-2">
              <h3 className="text-xs text-elf-light-blue uppercase tracking-wide">
                Request Body
              </h3>
              {curlState.body.trim() &&
                (() => {
                  try {
                    JSON.parse(curlState.body);
                    return (
                      <span
                        className="flex items-center gap-1 text-green-400 text-xs"
                        title="Valid JSON"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        JSON
                      </span>
                    );
                  } catch {
                    return null;
                  }
                })()}
            </div>
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
            className="w-full h-32 bg-elf-dark-blue rounded-md p-4 text-white border border-elf-mid-blue/30 focus:outline-none focus:ring-2 focus:ring-elf-yellow focus:border-transparent text-sm md:text-base resize-y"
            style={{
              fontFamily:
                "var(--font-jetbrains-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            }}
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
