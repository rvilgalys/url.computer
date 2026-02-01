export interface CurlOptions {
  method: string;
  headers: Record<string, string>;
  body: string;
  options: string[];
}

export interface AppState {
  url: string;
  curl: CurlOptions;
}

export type CurlRecipe = (state: AppState) => AppState;

export interface ParsedCurlResult {
  url: string | null;
  curlOptions: CurlOptions;
  isValid: boolean;
  error?: string;
}
