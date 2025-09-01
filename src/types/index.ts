export interface AppState {
  url: string;
  curl: {
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD";
    headers: Record<string, string>;
    body: string;
    options: string[];
  };
}

export type CurlRecipe = (state: AppState) => AppState;
