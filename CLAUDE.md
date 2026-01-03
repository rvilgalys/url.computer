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
- **Types**: `src/types/index.ts` - Core TypeScript interfaces including `AppState` and `CurlRecipe`

### State Structure

The application state is defined by the `AppState` interface:

- `url`: String containing the URL being analyzed
- `curl`: Object containing HTTP method, headers, body, and cURL options

### URL State Persistence

- State is automatically serialized, compressed with LZ-String, and stored in URL hash
- Enables shareable links that restore exact application state
- Default state loads when no hash is present to avoid polluting clean URLs

### URL Component System

**Two-Way Data Binding Architecture:**

- **URLAnalyzer** - Container component orchestrating bidirectional sync
- **Component Editors** - Individual editors for each URL part with validation
- **Real-time Updates** - Changes in components immediately update URL string and vice versa

**Built Components:**

- `ProtocolEditor` - Full cURL protocol suite (28 protocols) with context hints
- `HostnameEditor` - Domain/IP validation with real-time feedback
- `PathEditor` - Pathname validation and auto-formatting
- `QueryParamEditor` - Dynamic key-value pairs with add/remove functionality
- `FragmentEditor` - URL hash/fragment editing
- `CopyButton` - Reusable clipboard copy with success feedback

### URL Utilities (`src/lib/url.ts`)

- Native JavaScript `URL` API for robust parsing
- Comprehensive validation functions (hostname, pathname, protocol)
- RFC 3986 compliant protocol validation
- Safe URL component updating with error handling

### Project Structure

- `src/app/` - Next.js App Router pages and layout
- `src/components/` - React components (URL editors, UI components)
- `src/hooks/` - Custom React hooks (currently `useUrlState`)
- `src/lib/` - Utility functions and core logic (URL parsing, validation)
- `src/types/` - TypeScript type definitions
- `src/tests/` - Jest test files using `@testing-library/react`

### Current Project Status

- **Phase 3 Complete**: Full URL analyzer system with comprehensive component editors
- **105 Tests Passing**: Comprehensive test coverage for all utilities and components
- **Protocol Support**: Full cURL protocol suite (28 protocols) with validation and context hints
- **Two-Way Sync**: Real-time bidirectional editing between URL string and component editors
- **In Progress**: UI improvements with typeahead/autocomplete interface

## Technology Stack

- **Framework**: Next.js 15.5.2 with App Router and Turbopack
- **Language**: TypeScript with strict mode
- **State Management**: Custom hook with LZ-String compression
- **Testing**: Jest with jsdom environment and React Testing Library
- **Styling**: Tailwind CSS v4
- **UI Components**: Downshift (typeahead/autocomplete) - being added for improved UX

## Testing Strategy

- Hook testing uses `renderHook` and `act` from `@testing-library/react`
- Tests cover state initialization, URL hash parsing, and state updates
- All logic is tested in isolation before integration

## Development Notes

- The `@/` path alias maps to the `src/` root directory
- All functionality is client-side only for privacy
- Real-time URL synchronization between input and component editors is a key complexity
- Uses cURL "recipes" pattern for common command configurations

### Upcoming Enhancements

**Typeahead/Autocomplete Integration:**

- **Library**: Downshift for headless, accessible autocomplete components
- **Purpose**: Replace ProtocolEditor dropdown with typeahead for better UX
- **Design**: Create reusable `TypeaheadInput` component for protocol selection and future cURL options
- **Benefits**: Faster input for common protocols, discoverable suggestions, single interface

### Testing Coverage

- 105 tests passing across all utilities and components
- Component testing uses React Testing Library with Jest
- URL utilities have comprehensive validation test coverage
- All URL component editors tested for user interactions and edge cases
