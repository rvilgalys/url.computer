import { CurlOptions, ParsedCurlResult } from "../types";

export { type CurlOptions };

export function generateCurlCommand(
  url: string,
  options: CurlOptions,
  multiline = true,
): string {
  const parts: string[] = [];

  const separator = multiline ? " \\\n  " : " ";

  // Start with curl, method, and URL on the first line/chunk
  let firstLine = "curl";
  if (options.method !== "GET") {
    firstLine += ` -X ${options.method}`;
  }
  firstLine += ` '${escapeSingleQuotes(url)}'`;
  parts.push(firstLine);

  // Options
  if (options.options && options.options.length > 0) {
    if (multiline) {
      // checks for simple short flags (like -v, -L, -k) vs long flags
      const shortFlags = options.options.filter(
        (o) => o.startsWith("-") && o.length <= 3,
      );
      const longFlags = options.options.filter(
        (o) => !o.startsWith("-") || o.length > 3,
      );

      if (shortFlags.length > 0) {
        parts.push(shortFlags.join(" "));
      }
      if (longFlags.length > 0) {
        // Long flags each on own line
        parts.push(...longFlags);
      }
    } else {
      parts.push(...options.options);
    }
  }

  // Headers
  Object.entries(options.headers).forEach(([key, value]) => {
    parts.push(`-H '${escapeSingleQuotes(key)}: ${escapeSingleQuotes(value)}'`);
  });

  // Body
  if (
    options.body &&
    (["POST", "PUT", "PATCH", "DELETE"].includes(options.method) ||
      options.body.length > 0)
  ) {
    parts.push(`-d '${escapeSingleQuotes(options.body)}'`);
  }

  return parts.join(separator);
}

function escapeSingleQuotes(str: string): string {
  return str.replace(/'/g, "'\\''");
}

/**
 * Tokenizes a curl command string, handling quoted strings and backslash continuations.
 * Returns an array of tokens (arguments).
 */
function tokenizeCurlCommand(input: string): string[] {
  // Normalize line continuations (backslash followed by newline)
  const normalized = input.replace(/\\\n\s*/g, " ").trim();

  const tokens: string[] = [];
  let current = "";
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let i = 0;

  while (i < normalized.length) {
    const char = normalized[i];

    if (char === "\\" && !inSingleQuote && i + 1 < normalized.length) {
      // Escape sequence (outside single quotes)
      current += normalized[i + 1];
      i += 2;
      continue;
    }

    if (char === "'" && !inDoubleQuote) {
      if (inSingleQuote) {
        // Check for escaped single quote pattern: '\''
        if (normalized.slice(i, i + 4) === "'\\''") {
          current += "'";
          i += 4;
          continue;
        }
        inSingleQuote = false;
      } else {
        inSingleQuote = true;
      }
      i++;
      continue;
    }

    if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      i++;
      continue;
    }

    if ((char === " " || char === "\t") && !inSingleQuote && !inDoubleQuote) {
      if (current.length > 0) {
        tokens.push(current);
        current = "";
      }
      i++;
      continue;
    }

    current += char;
    i++;
  }

  if (current.length > 0) {
    tokens.push(current);
  }

  return tokens;
}

/**
 * Parses a curl command string into structured CurlOptions.
 * Handles URLs, methods, headers, body, and preserves unknown options.
 */
export function parseCurlCommand(input: string): ParsedCurlResult {
  const trimmed = input.trim();

  // Check if it starts with 'curl'
  if (!trimmed.toLowerCase().startsWith("curl")) {
    return {
      url: null,
      curlOptions: { method: "GET", headers: {}, body: "", options: [] },
      isValid: false,
      error: "Command must start with 'curl'",
    };
  }

  try {
    const tokens = tokenizeCurlCommand(trimmed);

    // Skip the 'curl' command itself
    const args = tokens.slice(1);

    let url: string | null = null;
    let method = "GET";
    const headers: Record<string, string> = {};
    let body = "";
    const options: string[] = [];

    let i = 0;
    while (i < args.length) {
      const arg = args[i];

      // Method: -X or --request
      if (arg === "-X" || arg === "--request") {
        if (i + 1 < args.length) {
          method = args[i + 1].toUpperCase();
          i += 2;
          continue;
        }
      }

      // Header: -H or --header
      if (arg === "-H" || arg === "--header") {
        if (i + 1 < args.length) {
          const headerValue = args[i + 1];
          const colonIndex = headerValue.indexOf(":");
          if (colonIndex > 0) {
            const key = headerValue.slice(0, colonIndex).trim();
            const value = headerValue.slice(colonIndex + 1).trim();
            headers[key] = value;
          }
          i += 2;
          continue;
        }
      }

      // Body: -d, --data, --data-raw, --data-binary
      if (
        arg === "-d" ||
        arg === "--data" ||
        arg === "--data-raw" ||
        arg === "--data-binary"
      ) {
        if (i + 1 < args.length) {
          body = args[i + 1];
          i += 2;
          continue;
        }
      }

      // URL: argument that looks like a URL (no dash prefix, contains :// or looks like domain)
      if (!arg.startsWith("-")) {
        // Could be a URL
        if (
          arg.includes("://") ||
          arg.match(/^[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}/)
        ) {
          url = arg;
          i++;
          continue;
        }
      }

      // Known simple flags that we recognize
      const knownSimpleFlags = ["-v", "-L", "-k", "-O", "-s", "-S", "-I"];
      if (knownSimpleFlags.includes(arg)) {
        options.push(arg);
        i++;
        continue;
      }

      // Flags with values that we want to preserve
      const flagsWithValues = [
        "-A",
        "--user-agent",
        "-u",
        "--user",
        "-x",
        "--proxy",
        "-b",
        "--cookie",
        "--key",
        "-o",
        "--output",
        "-e",
        "--referer",
        "-c",
        "--cookie-jar",
        "--cert",
        "--cacert",
        "-m",
        "--max-time",
        "--connect-timeout",
      ];

      if (flagsWithValues.some((f) => arg === f || arg.startsWith(f + " "))) {
        if (i + 1 < args.length) {
          // Combine flag and value
          options.push(`${arg} '${args[i + 1]}'`);
          i += 2;
          continue;
        }
      }

      // Unknown flag or option - preserve it
      if (arg.startsWith("-")) {
        // Check if next arg is a value (doesn't start with -)
        if (i + 1 < args.length && !args[i + 1].startsWith("-")) {
          options.push(`${arg} '${args[i + 1]}'`);
          i += 2;
        } else {
          options.push(arg);
          i++;
        }
        continue;
      }

      // Skip unknown positional args
      i++;
    }

    return {
      url,
      curlOptions: { method, headers, body, options },
      isValid: true,
    };
  } catch (error) {
    return {
      url: null,
      curlOptions: { method: "GET", headers: {}, body: "", options: [] },
      isValid: false,
      error: error instanceof Error ? error.message : "Failed to parse command",
    };
  }
}
