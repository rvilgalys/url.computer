/**
 * URL parsing and manipulation utilities using the native JavaScript URL API
 */

export interface ParsedUrl {
  protocol: string;  // e.g., "https:"
  hostname: string;  // e.g., "api.example.com"
  pathname: string;  // e.g., "/v1/users"
  searchParams: URLSearchParams;
  hash: string;      // e.g., "#section"
  isValid: boolean;
}

/**
 * Safely parse a URL string using the native URL API
 */
export function parseUrl(urlString: string): ParsedUrl {
  try {
    const url = new URL(urlString);
    return {
      protocol: url.protocol,
      hostname: url.hostname,
      pathname: url.pathname,
      searchParams: new URLSearchParams(url.search),
      hash: url.hash,
      isValid: true,
    };
  } catch (error) {
    // Return empty/invalid state for malformed URLs
    return {
      protocol: '',
      hostname: '',
      pathname: '',
      searchParams: new URLSearchParams(),
      hash: '',
      isValid: false,
    };
  }
}

/**
 * Check if a URL string is valid without creating a URL object
 */
export function isValidUrl(urlString: string): boolean {
  try {
    return URL.canParse ? URL.canParse(urlString) : Boolean(new URL(urlString));
  } catch {
    return false;
  }
}

/**
 * Reconstruct a full URL string from parsed components
 */
export function buildUrl(parsedUrl: Partial<ParsedUrl>): string {
  if (!parsedUrl.protocol || !parsedUrl.hostname) {
    return '';
  }

  try {
    // Start with protocol and hostname
    const url = new URL(`${parsedUrl.protocol}//${parsedUrl.hostname}`);
    
    // Set pathname if provided
    if (parsedUrl.pathname) {
      url.pathname = parsedUrl.pathname;
    }
    
    // Set search parameters if provided
    if (parsedUrl.searchParams) {
      url.search = parsedUrl.searchParams.toString();
    }
    
    // Set hash if provided
    if (parsedUrl.hash) {
      url.hash = parsedUrl.hash;
    }
    
    return url.toString();
  } catch (error) {
    return '';
  }
}

/**
 * Update a specific component of a URL and return the new URL string
 */
export function updateUrlComponent(
  urlString: string,
  component: keyof ParsedUrl,
  value: string | URLSearchParams
): string {
  const parsed = parseUrl(urlString);
  
  if (!parsed.isValid) {
    return urlString; // Return original if invalid
  }
  
  const updated = { ...parsed };
  
  switch (component) {
    case 'protocol':
      updated.protocol = value as string;
      break;
    case 'hostname':
      updated.hostname = value as string;
      break;
    case 'pathname':
      updated.pathname = value as string;
      break;
    case 'searchParams':
      updated.searchParams = value as URLSearchParams;
      break;
    case 'hash':
      updated.hash = value as string;
      break;
  }
  
  return buildUrl(updated);
}

/**
 * Add a query parameter to a URL
 */
export function addQueryParam(urlString: string, key: string, value: string): string {
  const parsed = parseUrl(urlString);
  if (!parsed.isValid) return urlString;
  
  parsed.searchParams.set(key, value);
  return buildUrl(parsed);
}

/**
 * Remove a query parameter from a URL
 */
export function removeQueryParam(urlString: string, key: string): string {
  const parsed = parseUrl(urlString);
  if (!parsed.isValid) return urlString;
  
  parsed.searchParams.delete(key);
  return buildUrl(parsed);
}

/**
 * Convert URLSearchParams to a plain object for easier manipulation
 */
export function searchParamsToObject(searchParams: URLSearchParams): Record<string, string> {
  const obj: Record<string, string> = {};
  for (const [key, value] of searchParams.entries()) {
    obj[key] = value;
  }
  return obj;
}

/**
 * Convert a plain object to URLSearchParams
 */
export function objectToSearchParams(obj: Record<string, string>): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(obj)) {
    if (key && value !== undefined) {
      params.set(key, value);
    }
  }
  return params;
}