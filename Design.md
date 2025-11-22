# Design Document: url.computer MVP

This document outlines the technical design and execution plan for the url.computer MVP. It is intended to be a living document that will be updated as the project progresses.

## 1. High-Level Architecture

The application will be a single-page application (SPA) built with Next.js and TypeScript. All logic will be client-side, and the application state will be persisted in the URL.

### 1.1. Directory Structure

We will use the `src` directory for our application code.

```
/Users/rimantasvilgalys/dev/url.computer/
├───Design.md
├───PRD.md
├───.git/...
├───mocks/
│   ├───dark.html
│   └───light.html
└───src/
    ├───.gitignore
    ├───eslint.config.mjs
    ├───jest.config.js
    ├───next-env.d.ts
    ├───next.config.ts
    ├───package-lock.json
    ├───package.json
    ├───postcss.config.mjs
    ├───README.md
    ├───tailwind.config.ts
    ├───tsconfig.json
    ├───.next/...
    ├───.swc/...
    ├───app/
    │   ├───favicon.ico
    │   ├───globals.css
    │   ├───layout.tsx
    │   └───page.tsx
    ├───hooks/
    │   └───useUrlState.ts
    ├───node_modules/...
    ├───public/
    │   ├───file.svg
    │   ├───globe.svg
    │   ├───next.svg
    │   ├───vercel.svg
    │   └───window.svg
    ├───tests/
    │   └───hooks/
    │       └───useUrlState.test.ts
    └───types/
        └───index.ts
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

The `useUrlState` hook will be tested using the `renderHook` utility from `@testing-library/react`. This is the current standard for testing hooks in isolation, replacing the deprecated `@testing-library/react-hooks` package.

**Testing (`tests/hooks/useUrlState.test.ts`):**

*   Test that the hook initializes with the default state when there is no hash in the URL.
*   Test that the hook correctly parses a compressed state from the URL hash on initialization.
*   Test that updating the state via the hook's setter function correctly updates the `window.location.hash` with the new compressed state.

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

### Phase 1: Project Setup [COMPLETED]

1.  Initialize a new Next.js project: `npx create-next-app@latest --typescript --tailwind .`
2.  Create the directory structure as outlined above.
3.  Install dependencies:
    *   `npm install lz-string`
    *   `npm install @types/lz-string --save-dev`
4.  Configure `tailwind.config.js` with the colors and fonts from the mocks.

### Phase 2: Core Types and State Management [COMPLETED]

This phase focuses on establishing the foundational state management for the application. We will now define the core data structures and create the custom hook responsible for synchronizing the application's state with the URL.

1.  **Create `src/types/index.ts`**: Define and export the `AppState` and `CurlRecipe` interfaces. This provides a single source of truth for our application's data structures. [COMPLETED]
2.  **Create `src/hooks/useUrlState.ts`**: Scaffold the `useUrlState` custom hook. [COMPLETED]
3.  **Implement State Serialization/Deserialization**: [COMPLETED]
    *   Within the hook, implement logic to read the `window.location.hash` on initial component mount.
    *   Use a `try...catch` block to safely parse the hash. Use `lz-string` to decompress the value.
    *   If parsing fails or no hash is present, initialize the hook with a default `AppState` object.
4.  **Implement State Update Logic**: [COMPLETED]
    *   Create a state setter function (e.g., `setAppState`) that will be returned by the hook.
    *   When this function is called, it should update the internal state and then trigger a side effect (e.g., in a `useEffect` hook) to serialize the new state, compress it with `lz-string`, and update the `window.location.hash`.
5.  **Write Tests in `tests/hooks/useUrlState.test.ts`**: [COMPLETED]
    *   Use `renderHook` from `@testing-library/react` to test the hook in isolation.
    *   **Test Case 1 (Initial State):** Verify the hook returns the default state when no URL hash is present.
    *   **Test Case 2 (State Hydration):** Mock `window.location.hash` with a pre-compressed state string and verify the hook initializes with the correct, decompressed state.
    *   **Test Case 3 (State Update):** Call the state setter function and use `act()` to wrap the update. Assert that `window.location.hash` is updated to the new, correctly compressed value.

### Phase 3: URL Analyzer [COMPLETED]

**Strategy**: Use native JavaScript `URL` API instead of custom parsing library for robust URL handling.

**Component Architecture:**
1.  **Create URL utility functions in `src/lib/url.ts`**: Helper functions using native `URL` API for parsing, validation, and reconstruction. [COMPLETED]
2.  **Build URL component editors**: Individual editors for each URL part (protocol, host, path, query params, fragment) with conditional rendering. [COMPLETED]
3.  **Create `URLAnalyzer` container**: Main component orchestrating bidirectional sync between URL string state and component editors. [COMPLETED]
4.  **Create `CopyButton` component**: Reusable component for copying text to clipboard. [COMPLETED]

**Two-Way Editing Pattern:**
- **Down**: URLAnalyzer parses URL string → passes components to child editors [COMPLETED]
- **Up**: Child editors call `onComponentChange(newValue)` → URLAnalyzer reconstructs full URL → updates state [COMPLETED]

**Error Handling**: Use `URL.canParse()` for validation with graceful degradation for invalid URLs. [COMPLETED]

**Components Built:**
- `ProtocolEditor` - Dropdown with full cURL protocol suite (28 protocols) plus custom input
- `HostnameEditor` - Input with validation for domain names and IP addresses
- `PathEditor` - Input with pathname validation and auto-formatting
- `QueryParamEditor` - Dynamic key-value editor with add/remove functionality
- `FragmentEditor` - Input for URL hash/fragment editing
- `URLAnalyzer` - Container orchestrating all editors with two-way sync
- `CopyButton` - Reusable clipboard copy component with success feedback

**Implementation Notes:**
- Created comprehensive URL utilities with validation functions
- Built Protocol validation following RFC 3986 specifications
- Full cURL protocol support with context hints for each protocol category
- QueryParamEditor supports dynamic add/remove with real-time sync
- URLAnalyzer includes input validation and error states
- All components tested with 105 total passing tests

### Phase 3.5: UI Improvements [IN PROGRESS]

**Typeahead/Autocomplete Enhancement:** [COMPLETED]

**Problem**: Current ProtocolEditor uses dropdown with 28+ protocols, which is clunky for common use cases (most users need http/https).

**Solution**: Replace dropdown interface with typeahead autocomplete for better UX.

**Library Choice**: **Downshift**
- **Rationale**: 2M weekly downloads, excellent TypeScript support, headless design (works with Tailwind), WAI-ARIA compliant
- **Benefits**: Small bundle size (14.34kb), flexible render patterns, strong LLM training context

**Implementation Strategy:**
1. Create reusable `TypeaheadInput` component using Downshift hooks
2. Replace ProtocolEditor dropdown with typeahead interface
3. Maintain all existing functionality (validation, context hints, colon auto-append)
4. Design for reusability (future cURL options typeahead in Phase 4)

**UX Improvements:**
- Faster for common protocols (just type "https")
- Still discoverable via filtered suggestions
- Single input interface (no toggle between modes)
- Better scalability for future protocols

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
