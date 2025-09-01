# Product Requirements Document: url.computer MVP

**Author:** Gemini
**Status:** Draft
**Version:** 1.1
**Last Updated:** September 1, 2025

## 1. Introduction & Vision

url.computer is a client-side web application designed to be an indispensable utility for developers, QA engineers, and students working with web technologies. Its core mission is to simplify the tedious tasks of parsing complex URLs and constructing cURL commands. By providing a clean, intuitive, and highly responsive interface, url.computer aims to deliver a "luxury developer experience"—giving technical users precisely what they need and getting out of their way.

The entire application will operate on the frontend, ensuring user data privacy and delivering instantaneous performance. The state of the tool will be encoded directly into the shareable URL, allowing for seamless collaboration and debugging.

## 2. Goals and Objectives (MVP)

*   **Goal 1:** Provide a frictionless, real-time interface for deconstructing and editing URLs into their constituent parts.
*   **Goal 2:** Simplify the creation and testing of cURL commands through a guided, interactive UI.
*   **Goal 3:** Enable seamless state sharing and persistence through a compressed URL, allowing users to save, bookmark, and share their exact sessions.
*   **Goal 4:** Establish a strong, minimalist design foundation that prioritizes speed and usability, setting the stage for future enhancements.

## 3. Target Audience & Personas

*   **Primary:** Experienced Frontend & Backend Developers (e.g., the user of this PRD). They need to quickly debug API calls, extract auth tokens, or build test commands. They value speed, keyboard shortcuts, and a no-fuss interface.
*   **Secondary:** Junior Developers & Students. They are learning about REST APIs, HTTP protocols, and URL structures. url.computer can serve as both a utility and an educational tool.
*   **Tertiary:** QA Engineers & Product Managers. They often need to test API endpoints or validate tracking links without diving deep into a terminal or Postman.

## 4. Core Features & Functional Requirements

### 4.1. URL Analyzer & Editor

This feature allows users to paste a URL and see it broken down into its components. It also allows for editing these components, with the main URL string updating in real-time.

*   **FR-1.1: URL Input:** A single, prominent text input field at the top of the page. The app will parse the contents of this field on paste or keystroke.
*   **FR-1.2: Component Display:** Below the input, the URL will be broken down into read-only and editable sections:
    *   **Scheme:** (e.g., https://)
    *   **Domain/Host:** (e.g., api.example.com)
    *   **Path:** (e.g., /v1/users/123)
    *   **Query Parameters:** A dynamic key-value editor.
        *   Each key and value pair will be displayed on its own line.
        *   A "copy" icon/button will be present for each key and each value.
        *   Each pair will have a "delete" (X) button.
        *   An "Add parameter" button will exist to add a new, empty key-value row.
    *   **Fragment:** (e.g., #section-3)
*   **FR-1.3: Real-time Sync:** Any change made in the component editors (e.g., editing a query parameter value, adding a new one) MUST instantly update the main URL string in the input field at the top.

### 4.2. cURL Command Builder

This section, located below the URL Analyzer, constructs a cURL command based on the URL and user-selected options. The UX will prioritize common "recipes" over granular flag selection.

*   **FR-2.1: Generated Command Display:** A read-only text area showing the complete, generated cURL command. It MUST have a prominent "Copy Command" button.
*   **FR-2.2: HTTP Method Selector:** A dropdown/selector to choose the HTTP method (e.g., GET, POST, PUT, PATCH, DELETE, HEAD). Default to GET.
*   **FR-2.3: cURL Recipes and Options:**
    *   A primary UI element displaying a list of clickable "chips" for common cURL recipes. Clicking a chip adds the appropriate flags and/or placeholder headers/body content.
    *   **Example Chips:** Verbose (-v), JSON Body, Include File, Set Bearer Token, Follow Redirects (-L), Accept Self-Signed Cert (-k).
    *   An input field with **typeahead search** to allow users to find and add any valid cURL flag from a comprehensive list.
*   **FR-2.4: Headers Editor:** A key-value editor for adding HTTP headers, identical in functionality to the Query Parameter editor (FR-1.2). This may be prepopulated by a recipe (e.g., Set Bearer Token).
*   **FR-2.5: Request Body Input:** A text area for inputting the request body (e.g., for POST or PUT requests). This section should be hidden by default for methods like GET and DELETE but can be revealed by a recipe (e.g., JSON Body).

### 4.3. State Persistence & Sharable Links

The application state is encoded and stored in the browser's URL, enabling persistence and sharing.

*   **FR-3.1: State Serialization:** The entire application state (URL input string, cURL method, headers, body, selected options) must be captured in a single JavaScript object.
*   **FR-3.2: URL Compression:** On any state change, the state object will be serialized to JSON, then compressed using **LZ-String** to a Base64 string.
*   **FR-3.3: Live URL Update:** The compressed state string will be appended to the current URL as a hash (e.g., https://url.computer/#s=[COMPRESSED_STRING]). This should update in near real-time without causing a page refresh.
*   **FR-3.4: State Hydration:** On page load, the application must check for the state string in the URL. If present, it must decompress, parse, and use the resulting object to populate the entire UI to its previous state.
*   **FR-3.5: Share Button:** A dedicated "Copy Shareable Link" button must be available to easily copy the full URL with the state hash.

## 5. User Journeys

*   **Journey 1: JWT Extraction**
    1.  A developer pastes a long redirect URL into the main input.
    2.  The URL Analyzer immediately populates, showing a token key and its long value in the Query Parameters section.
    3.  The developer clicks the "copy" icon next to the token value and pastes it into their IDE or another tool.
*   **Journey 2: Tracking ID Removal**
    1.  A student pastes a URL from a marketing email.
    2.  They see the query parameters, including one named `utm_campaign` or `tracking_id`.
    3.  They click the "delete" (X) icon next to that parameter.
    4.  The main URL in the input field at the top instantly updates to the cleaner version. They copy this new URL.
*   **Journey 3: API cURL Command Building**
    1.  A developer is working on a new localhost endpoint. They paste `http://localhost:3000/api/users` into the URL input.
    2.  In the cURL builder, they change the method to `POST`.
    3.  They add a header for `Content-Type: application/json`.
    4.  They paste a JSON object into the Request Body text area.
    5.  They click "Copy Command" and paste the complete cURL command into their terminal to test the endpoint.
*   **Journey 4: Collaborative Debugging**
    1.  A developer from Journey 3 is getting a `400 Bad Request` error.
    2.  They click the "Copy Shareable Link" button in url.computer.
    3.  They send this link to a senior developer.
    4.  The senior dev opens the link and sees the exact same URL, `POST` method, headers, and body that the junior dev was using, allowing them to replicate and debug the issue instantly.

## 6. Technology Stack

*   **Framework:** Next.js (with App Router for performance)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **State Compression:** LZ-String
*   **Deployment:** Vercel

## 7. Non-Functional Requirements

*   **Performance:** The application must load near-instantly. All UI interactions (parsing, command generation, URL updates) must feel instantaneous, with no discernible lag.
*   **Privacy:** All parsing and state management must be 100% client-side. No user-entered data should ever be sent to a server. This is a critical trust factor.
*   **Responsiveness:** The layout must be fully responsive and usable on mobile devices, even if it is primarily a desktop tool.
*   **Accessibility:** The application should follow best practices for accessibility (keyboard navigation, proper color contrast, ARIA labels).

## 8. Out of Scope for MVP

The following features are valuable but will not be included in the initial MVP release to ensure a focused and rapid launch:

*   Smart interpretation of content (e.g., identifying JWTs, Base64 strings).
*   Domain inspection (WHOIS lookups, DNS info).
*   Integrated documentation links or "Explainers" for URL components and cURL flags.
*   User accounts or saved history (persistence is handled solely by the URL).

### 8.1. Post-MVP Considerations

*   Automatic URL encoding/decoding in the query parameter editor for improved usability.
*   Support for complex request body types, such as `multipart/form-data` for file uploads.

## 9. Success Metrics

As a solo project, success will be measured qualitatively initially:

*   Positive feedback and adoption within developer communities (e.g., Reddit, Hacker News, X).
*   Usefulness in the creator's own daily workflow.
*   User-submitted feature requests and bug reports, indicating active engagement.
*   (Post-launch) Vercel Analytics can be used to track basic usage patterns and visitor counts.
