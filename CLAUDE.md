# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

url.computer is a client-side web application for parsing URLs and generating cURL commands. It's built as a luxury developer tool that operates entirely in the browser for privacy and instant performance.

## Development Commands

All commands should be run from the `src/` directory:

```bash
# Development server with Turbopack
npm run dev

# Build application with Turbopack
npm run build

# Production server
npm start

# Linting
npm run lint

# Testing
npm test
```

## Architecture

### Core State Management

- **State Hook**: `src/hooks/useUrlState.ts` - Custom hook managing application state with URL hash persistence using LZ-String compression
- **Persistence Hooks**: `src/hooks/useLocalStorage.ts` - Generic hook for handling local storage with SSR safety
- **Saved States Hook**: `src/hooks/useSavedStates.ts` - Hook for managing saved URL/cURL states in localStorage
- **Types**: `src/types/index.ts` - Core TypeScript interfaces including `AppState` and `CurlRecipe`

### State Structure

The application state is defined by the `AppState` interface:

- `url`: String containing the URL being analyzed
- `curl`: Object containing HTTP method, headers, body, and cURL options

### URL State Persistence

- State is automatically serialized, compressed with LZ-String, and stored in URL hash
- Enables shareable links that restore exact application state
- Default state loads when no hash is present to avoid polluting clean URLs
- States can be saved to localStorage and restored from a sidebar

### URL Component System

**Two-Way Data Binding Architecture:**

- **URLAnalyzer** - Container component orchestrating bidirectional sync
- **Component Editors** - Individual editors for each URL part with validation
- **Real-time Updates** - Changes in components immediately update URL string and vice versa

**Built Components:**

- `ProtocolEditor` - Typeahead autocomplete with full cURL protocol suite (28 protocols) and context hints
- `HostnameEditor` - Domain/IP validation with real-time feedback
- `PathEditor` - Pathname validation and auto-formatting
- `QueryParamEditor` - Dynamic key-value pairs with add/remove functionality
- `FragmentEditor` - URL hash/fragment editing
- `CopyButton` - Reusable clipboard copy with success feedback
- `TypeaheadInput` - Reusable Downshift-powered autocomplete component
- `CurlBuilder` - cURL command builder with method selection, headers, body, recipes
- `HeadersEditor` - Key-value editor for HTTP headers
- `SavedStatesSidebar` - Sidebar for managing localStorage-persisted states
- `SavedStateCard` - Individual saved state display with rename/delete

### URL Utilities (`src/lib/url.ts`)

- Native JavaScript `URL` API for robust parsing
- Comprehensive validation functions (hostname, pathname, protocol)
- RFC 3986 compliant protocol validation
- Safe URL component updating with error handling

### cURL Utilities (`src/lib/curl.ts`, `src/lib/curlRecipes.ts`)

- cURL command generation from application state
- Recipe system for common cURL configurations (JSON body, Bearer token, verbose, etc.)

### Project Structure

- `src/app/` - Next.js App Router pages and layout
- `src/app/[[...slug]]/` - Main application page (URL analyzer + cURL builder)
- `src/app/docs/` - Documentation page
- `src/app/about/` - About page
- `src/components/` - React components (URL editors, cURL builder, UI components)
- `src/hooks/` - Custom React hooks (useUrlState, useLocalStorage, useSavedStates)
- `src/lib/` - Utility functions and core logic (URL parsing, validation, cURL generation)
- `src/types/` - TypeScript type definitions
- `src/tests/` - Jest test files using `@testing-library/react`

### Current Project Status

- **MVP Complete**: Full URL analyzer + cURL builder with localStorage saved states and shareable links
- **Comprehensive Test Coverage**: All utilities and components tested
- **Protocol Support**: Full cURL protocol suite (28 protocols) with typeahead autocomplete and context hints
- **Two-Way Sync**: Real-time bidirectional editing between URL string and component editors
- **State Persistence**: URL hash sharing + localStorage saved states sidebar

## Technology Stack

- **Framework**: Next.js 15.5.2 with App Router and Turbopack
- **Language**: TypeScript with strict mode
- **State Management**: Custom hook with LZ-String compression
- **Testing**: Jest with jsdom environment and React Testing Library
- **Styling**: Tailwind CSS v4
- **UI Components**: Downshift (typeahead/autocomplete)

## Testing Strategy

- Hook testing uses `renderHook` and `act` from `@testing-library/react`
- Tests cover state initialization, URL hash parsing, and state updates
- All logic is tested in isolation before integration

## Development Notes

- The `@/` path alias maps to the `src/` root directory
- All functionality is client-side only for privacy
- Real-time URL synchronization between input and component editors is a key complexity
- Uses cURL "recipes" pattern for common command configurations
