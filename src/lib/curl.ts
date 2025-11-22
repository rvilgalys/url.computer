
import { CurlOptions } from '../types';

export { type CurlOptions };

export function generateCurlCommand(url: string, options: CurlOptions): string {
  const parts: string[] = ['curl'];

  // Method
  if (options.method !== 'GET') {
    parts.push(`-X ${options.method}`);
  }

  // URL (escaped)
  parts.push(`'${escapeSingleQuotes(url)}'`);

  // Options
  if (options.options && options.options.length > 0) {
    parts.push(...options.options);
  }

  // Headers
  Object.entries(options.headers).forEach(([key, value]) => {
    parts.push(`-H '${escapeSingleQuotes(key)}: ${escapeSingleQuotes(value)}'`);
  });

  // Body
  if (options.body && options.method !== 'GET' && options.method !== 'HEAD') {
    parts.push(`-d '${escapeSingleQuotes(options.body)}'`);
  }

  return parts.join(' ');
}

function escapeSingleQuotes(str: string): string {
  return str.replace(/'/g, "'\\''");
}
