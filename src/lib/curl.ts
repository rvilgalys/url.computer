import { CurlOptions } from "../types";

export { type CurlOptions };

export function generateCurlCommand(
  url: string,
  options: CurlOptions,
  multiline = true
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
        (o) => o.startsWith("-") && o.length <= 3
      );
      const longFlags = options.options.filter(
        (o) => !o.startsWith("-") || o.length > 3
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
