
import { generateCurlCommand, CurlOptions } from './curl';

describe('generateCurlCommand', () => {
  const defaultUrl = 'https://api.example.com/v1/users';

  it('generates a simple GET request by default', () => {
    const options: CurlOptions = {
      method: 'GET',
      headers: {},
      body: '',
      options: [],
    };
    const command = generateCurlCommand(defaultUrl, options);
    expect(command).toBe("curl 'https://api.example.com/v1/users'");
  });

  it('adds -X POST for POST requests', () => {
    const options: CurlOptions = {
      method: 'POST',
      headers: {},
      body: '',
      options: [],
    };
    const command = generateCurlCommand(defaultUrl, options);
    expect(command).toContain("-X POST");
  });

  it('adds headers with -H', () => {
    const options: CurlOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token',
      },
      body: '',
      options: [],
    };
    const command = generateCurlCommand(defaultUrl, options);
    expect(command).toContain("-H 'Content-Type: application/json'");
    expect(command).toContain("-H 'Authorization: Bearer token'");
  });

  it('adds body with -d for POST requests', () => {
    const options: CurlOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"key":"value"}',
      options: [],
    };
    const command = generateCurlCommand(defaultUrl, options);
    expect(command).toContain("-d '{\"key\":\"value\"}'");
  });

  it('handles extra options', () => {
    const options: CurlOptions = {
      method: 'GET',
      headers: {},
      body: '',
      options: ['-v', '-L'],
    };
    const command = generateCurlCommand(defaultUrl, options);
    expect(command).toContain("-v");
    expect(command).toContain("-L");
  });
  
  it('escapes single quotes in URL', () => {
      const urlWithQuote = "https://example.com/path'with'quote";
      const options: CurlOptions = {
          method: 'GET',
          headers: {},
          body: '',
          options: [],
      };
      const command = generateCurlCommand(urlWithQuote, options);
      // Ideally it should be 'https://example.com/path'\''with'\''quote'
      expect(command).toContain("'\\''");
  });
});
