<p align="center">
  <img src="src/public/banner.svg" alt="url.computer banner" width="600" />
</p>

# url.computer

A client-side web application for parsing URLs and generating cURL commands. It runs entirely in the browser for privacy and instant performance.

## About

[url.computer](https://url.computer) is a developer utility designed for quick URL parsing, editing, and cURL construction, particularly for local development and debugging.

- **Two-Way Editing**: Paste any URL to deconstruct it into its constituent components (protocol, hostname, path, query parameters, and fragment). Edit any component and the full URL string updates in real time.
- **cURL Builder**: Build cURL commands by choosing HTTP methods, editing headers, setting request bodies, and applying preset recipes (JSON body, Bearer auth, verbose mode, etc.).
- **Shareable Links**: The application state is compressed using LZ-String and stored in the URL hash. Copy and send the link to replicate the exact session.
- **Saved States**: Save configurations to your browser's local storage for quick access.
- **Privacy First**: Everything runs locally in your browser. No data is sent to a server. Your URLs, headers, and tokens stay on your machine.

You can also interface with url.computer directly through the URL:

- **Direct Parsing**: Append any URL to parse it immediately:
  `https://url.computer/https://example.com/api`
- **Link Cleaning**: Strip link-tracking queries automatically by using the `/clean` path:
  `https://url.computer/clean/https://example.com?utm_source=email&tracking_id=123`

## Issues & feature requests

Since url.computer is a client-side utility, this GitHub repository is the main contact point for support.

- **Bugs & Issues**: Report problems or parser issues using the [GitHub Issue Tracker](https://github.com/rvilgalys/url.computer/issues).
- **Features & Recipes**: Suggest new cURL recipes, parameter clean-up rules, or UI features.

## Use Cases

- **Stripping Tracking Parameters**: Remove UTM parameters and tracking IDs from URLs before sharing.
- **Token & Parameter Extraction**: Isolate, view, and copy long auth tokens or query values.
- **API Debugging**: Construct cURL commands with custom methods, headers, and request bodies for testing localhost endpoints.
- **Collaborative Debugging**: Share a stateful URL hash with teammates to inspect and run the same HTTP request.

## Running locally

To run the application locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/rvilgalys/url.computer.git
   ```
2. Navigate to the `src` directory and install dependencies:
   ```bash
   cd url.computer/src
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

Run these commands inside the `src` directory:

- `npm run dev` — Start the development server with Turbopack.
- `npm run build` — Build the application for production.
- `npm start` — Start the production server.
- `npm run lint` — Run ESLint.
- `npm test` — Run the Jest test suite.

## License

This project is licensed under the MIT License. See [LICENSE.md](LICENSE.md) for details.
