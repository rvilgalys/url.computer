import { generateCurlCommand, CurlOptions } from "../../lib/curl";

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
      "curl -X POST 'https://api.example.com/v1/users'"
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
