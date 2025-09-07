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
- **Types**: `src/types/index.ts` - Core TypeScript interfaces including `AppState` and `CurlRecipe`

### State Structure
The application state is defined by the `AppState` interface:
- `url`: String containing the URL being analyzed
- `curl`: Object containing HTTP method, headers, body, and cURL options

### URL State Persistence
- State is automatically serialized, compressed with LZ-String, and stored in URL hash
- Enables shareable links that restore exact application state
- Default state loads when no hash is present to avoid polluting clean URLs

### Project Structure
- `src/app/` - Next.js App Router pages and layout
- `src/hooks/` - Custom React hooks (currently `useUrlState`)
- `src/types/` - TypeScript type definitions
- `src/tests/` - Jest test files using `@testing-library/react`

## Technology Stack
- **Framework**: Next.js 15.5.2 with App Router and Turbopack
- **Language**: TypeScript with strict mode
- **State Management**: Custom hook with LZ-String compression
- **Testing**: Jest with jsdom environment and React Testing Library
- **Styling**: Tailwind CSS v4

## Testing Strategy
- Hook testing uses `renderHook` and `act` from `@testing-library/react`
- Tests cover state initialization, URL hash parsing, and state updates
- All logic is tested in isolation before integration

## Development Notes
- The `@/` path alias maps to the `src/` root directory
- All functionality is client-side only for privacy
- Real-time URL synchronization between input and component editors is a key complexity
- Uses cURL "recipes" pattern for common command configurations