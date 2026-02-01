import {
  generateCurlCommand,
  parseCurlCommand,
  CurlOptions,
} from "../../lib/curl";

describe("generateCurlCommand", () => {
  const defaultUrl = "https://api.example.com/v1/users";

  it("generates a simple GET request by default (single line legacy)", () => {
    const options: CurlOptions = {
      method: "GET",
      headers: {},
      body: "",
      options: [],
    };
    const command = generateCurlCommand(defaultUrl, options, false);
    expect(command).toBe("curl 'https://api.example.com/v1/users'");
  });

  it("generates multi-line command with curl and URL on first line", () => {
    const options: CurlOptions = {
      method: "GET",
      headers: { Header: "Value" },
      body: "",
      options: [],
    };
    const command = generateCurlCommand(defaultUrl, options, true);

    const lines = command.split("\n");
    // Line 0 should contain curl and URL
    expect(lines[0]).toContain("curl");
    expect(lines[0]).toContain("'https://api.example.com/v1/users'");
    expect(lines[0]).toContain(" \\");

    // Line 1 should be indented header
    expect(lines[1]).toContain("  -H 'Header: Value'");
  });

  it("includes Method on first line in multi-line mode", () => {
    const options: CurlOptions = {
      method: "POST",
      headers: {},
      body: "",
      options: [],
    };
    const command = generateCurlCommand(defaultUrl, options, true);
    // Should be `curl -X POST 'url'`
    expect(command).toContain(
      "curl -X POST 'https://api.example.com/v1/users'",
    );
  });

  it("adds -X POST for POST requests (single line)", () => {
    const options: CurlOptions = {
      method: "POST",
      headers: {},
      body: "",
      options: [],
    };
    const command = generateCurlCommand(defaultUrl, options, false);
    expect(command).toContain("-X POST");
  });

  it("adds headers with -H", () => {
    const options: CurlOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer token",
      },
      body: "",
      options: [],
    };
    const command = generateCurlCommand(defaultUrl, options, false);
    expect(command).toContain("-H 'Content-Type: application/json'");
    expect(command).toContain("-H 'Authorization: Bearer token'");
  });

  it("adds body with -d for POST requests", () => {
    const options: CurlOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: '{"key":"value"}',
      options: [],
    };
    const command = generateCurlCommand(defaultUrl, options, false);
    expect(command).toContain('-d \'{"key":"value"}\'');
  });

  it("handles extra options", () => {
    const options: CurlOptions = {
      method: "GET",
      headers: {},
      body: "",
      options: ["-v", "-L"],
    };
    const command = generateCurlCommand(defaultUrl, options, false);
    expect(command).toContain("-v");
    expect(command).toContain("-L");
  });

  it("escapes single quotes in URL", () => {
    const urlWithQuote = "https://example.com/path'with'quote";
    const options: CurlOptions = {
      method: "GET",
      headers: {},
      body: "",
      options: [],
    };
    const command = generateCurlCommand(urlWithQuote, options, false);
    expect(command).toContain("'\\''");
  });
});

describe("parseCurlCommand", () => {
  it("parses simple GET request", () => {
    const result = parseCurlCommand("curl 'https://example.com'");
    expect(result.isValid).toBe(true);
    expect(result.url).toBe("https://example.com");
    expect(result.curlOptions.method).toBe("GET");
  });

  it("parses GET with explicit -X method", () => {
    const result = parseCurlCommand("curl -X GET 'https://example.com'");
    expect(result.isValid).toBe(true);
    expect(result.url).toBe("https://example.com");
    expect(result.curlOptions.method).toBe("GET");
  });

  it("parses POST request", () => {
    const result = parseCurlCommand("curl -X POST 'https://example.com'");
    expect(result.isValid).toBe(true);
    expect(result.curlOptions.method).toBe("POST");
  });

  it("parses headers", () => {
    const result = parseCurlCommand(
      "curl -H 'Content-Type: application/json' -H 'Authorization: Bearer token123' 'https://example.com'",
    );
    expect(result.isValid).toBe(true);
    expect(result.curlOptions.headers["Content-Type"]).toBe("application/json");
    expect(result.curlOptions.headers["Authorization"]).toBe("Bearer token123");
  });

  it("parses body with -d flag", () => {
    const result = parseCurlCommand(
      `curl -X POST -d '{"key":"value"}' 'https://example.com'`,
    );
    expect(result.isValid).toBe(true);
    expect(result.curlOptions.body).toBe('{"key":"value"}');
  });

  it("parses multiple short flags", () => {
    const result = parseCurlCommand("curl -v -L -k 'https://example.com'");
    expect(result.isValid).toBe(true);
    expect(result.curlOptions.options).toContain("-v");
    expect(result.curlOptions.options).toContain("-L");
    expect(result.curlOptions.options).toContain("-k");
  });

  it("parses multi-line command with backslash continuations", () => {
    const result = parseCurlCommand(`curl \\
      -X POST \\
      -H 'Content-Type: application/json' \\
      'https://example.com/api'`);
    expect(result.isValid).toBe(true);
    expect(result.curlOptions.method).toBe("POST");
    expect(result.curlOptions.headers["Content-Type"]).toBe("application/json");
    expect(result.url).toBe("https://example.com/api");
  });

  it("preserves unknown options", () => {
    const result = parseCurlCommand(
      "curl --some-unknown-flag 'value' 'https://example.com'",
    );
    expect(result.isValid).toBe(true);
    expect(result.curlOptions.options).toContainEqual(
      expect.stringContaining("--some-unknown-flag"),
    );
  });

  it("returns isValid false for non-curl input", () => {
    const result = parseCurlCommand("wget https://example.com");
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("must start with 'curl'");
  });

  it("returns isValid false for random text", () => {
    const result = parseCurlCommand("this is just some random text");
    expect(result.isValid).toBe(false);
  });

  it("parses user agent option", () => {
    const result = parseCurlCommand(
      "curl -A 'Mozilla/5.0' 'https://example.com'",
    );
    expect(result.isValid).toBe(true);
    expect(result.curlOptions.options).toContainEqual(
      expect.stringContaining("-A"),
    );
    expect(result.curlOptions.options).toContainEqual(
      expect.stringContaining("Mozilla/5.0"),
    );
  });

  it("parses basic auth option", () => {
    const result = parseCurlCommand(
      "curl -u 'user:pass' 'https://example.com'",
    );
    expect(result.isValid).toBe(true);
    expect(result.curlOptions.options).toContainEqual(
      expect.stringContaining("-u"),
    );
  });

  it("parses URL without protocol (domain pattern)", () => {
    const result = parseCurlCommand("curl example.com/path");
    expect(result.isValid).toBe(true);
    expect(result.url).toBe("example.com/path");
  });

  it("parses double-quoted strings", () => {
    const result = parseCurlCommand(
      `curl -H "Content-Type: application/json" "https://example.com"`,
    );
    expect(result.isValid).toBe(true);
    expect(result.curlOptions.headers["Content-Type"]).toBe("application/json");
    expect(result.url).toBe("https://example.com");
  });

  it("handles --data-raw flag", () => {
    const result = parseCurlCommand(
      `curl -X POST --data-raw '{"test":true}' 'https://example.com'`,
    );
    expect(result.isValid).toBe(true);
    expect(result.curlOptions.body).toBe('{"test":true}');
  });

  it("handles complex real-world curl from browser DevTools", () => {
    const browserCurl = `curl 'https://api.example.com/v1/users' \\
      -H 'accept: application/json' \\
      -H 'accept-language: en-US,en;q=0.9' \\
      -H 'authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' \\
      -H 'content-type: application/json' \\
      --data-raw '{"name":"test"}' \\
      --compressed`;

    const result = parseCurlCommand(browserCurl);
    expect(result.isValid).toBe(true);
    expect(result.url).toBe("https://api.example.com/v1/users");
    expect(result.curlOptions.headers["accept"]).toBe("application/json");
    expect(result.curlOptions.headers["authorization"]).toContain("Bearer");
    expect(result.curlOptions.body).toBe('{"name":"test"}');
  });
});
