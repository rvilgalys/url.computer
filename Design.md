# Design Document: url.computer MVP

This document outlines the technical design and execution plan for the url.computer MVP. It is intended to be a living document that will be updated as the project progresses.

## 1. High-Level Architecture

The application will be a single-page application (SPA) built with Next.js and TypeScript. All logic will be client-side, and the application state will be persisted in the URL.

### 1.1. Directory Structure

We will use the `src` directory for our application code.

```
/
├── src/
│   ├── app/
│   │   └── page.tsx
│   ├── components/
│   │   ├── url-analyzer/
│   │   │   ├── QueryParamEditor.tsx
│   │   │   └── URLAnalyzer.tsx
│   │   ├── curl-builder/
│   │   │   ├── CurlCommand.tsx
│   │   │   └── CurlBuilder.tsx
│   │   └── ui/
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       ├── CopyButton.tsx
│   │       └── ...
│   ├── hooks/
│   │   └── useUrlState.ts
│   ├── lib/
│   │   ├── url.ts
│   │   ├── curl.ts
│   │   └── state.ts
│   ├── styles/
│   │   └── globals.css
│   └── types/
│       └── index.ts
├── tests/
│   ├── hooks/
│   │   └── useUrlState.test.ts
│   ├── lib/
│   │   ├── url.test.ts
│   │   └── curl.test.ts
│   └── components/
│       └── ...
└── package.json
```

## 2. State Management

The entire application state will be managed by a single state object. This object will be serialized, compressed, and stored in the URL hash.

### 2.1. State Interface

We will define a TypeScript interface for the application state:

```typescript
// src/types/index.ts

export interface AppState {
  url: string;
  curl: {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD';
    headers: Record<string, string>;
    body: string;
    options: string[];
  };
}
```

### 2.2. State Hook

We will create a custom hook, `useUrlState`, to manage the application state. This hook will handle:

*   **Initialization**: Reading the state from the URL on initial load.
*   **Updates**: Updating the state object and the URL hash whenever a change is made.
*   **Serialization/Deserialization**: Using `lz-string` to compress and decompress the state.

### 2.3. Testing the State Hook

We can test the `useUrlState` hook using the `@testing-library/react-hooks` library. This will allow us to test the hook's logic in isolation.

**Testing (`tests/hooks/useUrlState.test.ts`):**

*   Test that the hook initializes with the default state when there is no hash in the URL.
*   Test that the hook correctly parses the state from the URL hash on initialization.
*   Test that updating the state also updates the URL hash with the compressed state.

## 3. Component Breakdown

### 3.1. `URLAnalyzer`

*   **Responsibility**: Displays the components of the URL and allows for editing.
*   **Props**: `url: string`, `onUrlChange: (newUrl: string) => void`.

### 3.2. `QueryParamEditor`

*   **Responsibility**: Displays and allows editing of query parameters.
*   **Props**: `queryParams: URLSearchParams`, `onQueryParamsChange: (newQueryParams: URLSearchParams) => void`.

### 3.3. `CurlBuilder`

*   **Responsibility**: Displays the cURL command and allows for editing of cURL options.
*   **Props**: `appState: AppState`, `onCurlChange: (newCurlState: AppState['curl']) => void`.

### 3.4. `CurlCommand`

*   **Responsibility**: Renders the generated cURL command with syntax highlighting.
*   **Props**: `command: string`.

### 3.5. `CopyButton`

*   **Responsibility**: A reusable button component that copies a given text to the clipboard.
*   **Props**: `textToCopy: string`, `children: React.ReactNode`, `style?: React.CSSProperties`.

## 4. Core Logic & Business Logic (TDD)

### 4.1. URL Parsing and Building (`src/lib/url.ts`)

This module will contain functions for parsing and building URLs.

### 4.2. cURL Command Generation (`src/lib/curl.ts`)

This module will contain functions for generating the cURL command.

### 4.3. cURL Recipe Design

A cURL recipe is a function that takes the current `AppState` and returns a modified `AppState`. This allows us to chain recipes and apply them in a predictable way.

```typescript
// src/types/index.ts

export type CurlRecipe = (state: AppState) => AppState;
```

**Example Recipe:**

```typescript
// src/lib/curl.ts

export const setJsonBodyRecipe: CurlRecipe = (state) => {
  const newHeaders = { ...state.curl.headers, 'Content-Type': 'application/json' };
  return {
    ...state,
    curl: {
      ...state.curl,
      headers: newHeaders,
    },
  };
};
```

For the typeahead search of cURL options, we will eventually parse the cURL man page into a JSON object. This will be a separate task, but the recipe structure is designed to be flexible enough to accommodate this data source.

## 5. Execution Plan

### Phase 1: Project Setup

1.  Initialize a new Next.js project: `npx create-next-app@latest --typescript --tailwind .`
2.  Create the directory structure as outlined above.
3.  Install dependencies:
    *   `npm install lz-string`
    *   `npm install @types/lz-string @testing-library/react-hooks --save-dev`
4.  Configure `tailwind.config.js` with the colors and fonts from the mocks:

    ```javascript
    // tailwind.config.js
    /** @type {import('tailwindcss').Config} */
    module.exports = {
      content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
      ],
      theme: {
        extend: {
          colors: {
            'elf-dark-blue': '#023047',
            'elf-mid-blue': '#219ebc',
            'elf-light-blue': '#8ecae6',
            'elf-yellow': '#ffb703',
            'elf-orange': '#fb8500',
          },
          fontFamily: {
            sans: ['Roboto', 'sans-serif'],
            mono: ['"JetBrains Mono"', 'monospace'],
          },
        },
      },
      plugins: [],
    };
    ```

### Phase 2: Core Types and State Management

1.  Define the `AppState` and `CurlRecipe` interfaces in `src/types/index.ts`.
2.  Implement the `useUrlState` hook in `src/hooks/useUrlState.ts`.
3.  Write tests for the `useUrlState` hook in `tests/hooks/useUrlState.test.ts`.

### Phase 3: URL Analyzer

1.  Develop the URL parsing and building functions in `src/lib/url.ts` using TDD.
2.  Create the `QueryParamEditor` and `URLAnalyzer` components.
3.  Create the `CopyButton` component.

### Phase 4: cURL Builder

1.  Develop the cURL command generation functions and recipes in `src/lib/curl.ts` using TDD.
2.  Create the `CurlCommand` and `CurlBuilder` components.

### Phase 5: Integration and Styling

1.  Integrate all components into the main application page.
2.  Style all components to match the mocks.

### Phase 6: Final Touches and Testing

1.  Add end-to-end tests.
2.  Perform thorough manual testing.

## 6. Complex Areas & Notes

*   **Two-Way Data Binding for URL**: The real-time synchronization between the URL input and the component editors will be the most complex part.
*   **cURL Options Typeahead**: The typeahead for cURL options is a post-MVP feature but the recipe design should accommodate it.
