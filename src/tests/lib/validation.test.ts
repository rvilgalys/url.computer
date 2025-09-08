import { validateHostname, validatePathname, validateProtocol, updateUrlComponentSafe } from '../../lib/url';

describe('Hostname Validation', () => {
  it('should validate correct hostnames', () => {
    expect(validateHostname('example.com')).toEqual({ isValid: true });
    expect(validateHostname('api.example.com')).toEqual({ isValid: true });
    expect(validateHostname('localhost')).toEqual({ isValid: true });
    expect(validateHostname('192.168.1.1')).toEqual({ isValid: true });
    expect(validateHostname('sub.domain.example.com')).toEqual({ isValid: true });
  });

  it('should reject empty hostnames', () => {
    expect(validateHostname('')).toEqual({
      isValid: false,
      error: 'Hostname cannot be empty'
    });
  });

  it('should reject hostnames with consecutive dots', () => {
    expect(validateHostname('example..com')).toEqual({
      isValid: false,
      error: 'Domain cannot contain consecutive dots'
    });
  });

  it('should reject hostnames with invalid characters', () => {
    expect(validateHostname('example@.com')).toEqual({
      isValid: false,
      error: 'Invalid characters in domain'
    });
    expect(validateHostname('example .com')).toEqual({
      isValid: false,
      error: 'Invalid characters in domain'
    });
  });

  it('should reject hostnames with invalid formats', () => {
    expect(validateHostname('-example.com')).toEqual({
      isValid: false,
      error: 'Invalid domain format'
    });
    expect(validateHostname('example.com-')).toEqual({
      isValid: false,
      error: 'Invalid domain format'
    });
  });
});

describe('Pathname Validation', () => {
  it('should validate correct pathnames', () => {
    expect(validatePathname('/path')).toEqual({ isValid: true });
    expect(validatePathname('/path/to/resource')).toEqual({ isValid: true });
    expect(validatePathname('/api/v1/users')).toEqual({ isValid: true });
    expect(validatePathname('/file.txt')).toEqual({ isValid: true });
    expect(validatePathname('')).toEqual({ isValid: true }); // Empty path is valid
  });

  it('should reject paths that do not start with /', () => {
    expect(validatePathname('path')).toEqual({
      isValid: false,
      error: 'Path must start with /'
    });
    expect(validatePathname('api/v1/users')).toEqual({
      isValid: false,
      error: 'Path must start with /'
    });
  });

  it('should reject paths with invalid characters', () => {
    expect(validatePathname('/path<script>')).toEqual({
      isValid: false,
      error: 'Path contains invalid characters'
    });
    expect(validatePathname('/path"with"quotes')).toEqual({
      isValid: false,
      error: 'Path contains invalid characters'
    });
    expect(validatePathname('/path{with}braces')).toEqual({
      isValid: false,
      error: 'Path contains invalid characters'
    });
  });
});

describe('Protocol Validation', () => {
  it('should validate correct protocols', () => {
    expect(validateProtocol('https:')).toEqual({ isValid: true });
    expect(validateProtocol('http:')).toEqual({ isValid: true });
    expect(validateProtocol('ftp:')).toEqual({ isValid: true });
    expect(validateProtocol('custom:')).toEqual({ isValid: true });
    expect(validateProtocol('my-protocol:')).toEqual({ isValid: true });
    expect(validateProtocol('test+protocol:')).toEqual({ isValid: true });
    expect(validateProtocol('protocol.v2:')).toEqual({ isValid: true });
  });

  it('should reject empty protocols', () => {
    expect(validateProtocol('')).toEqual({
      isValid: false,
      error: 'Protocol cannot be empty'
    });
  });

  it('should reject protocols without colon', () => {
    expect(validateProtocol('https')).toEqual({
      isValid: false,
      error: 'Protocol must end with :'
    });
    expect(validateProtocol('ftp')).toEqual({
      isValid: false,
      error: 'Protocol must end with :'
    });
  });

  it('should reject protocols with invalid characters', () => {
    expect(validateProtocol('ht@tps:')).toEqual({
      isValid: false,
      error: 'Invalid protocol format'
    });
    expect(validateProtocol('proto col:')).toEqual({
      isValid: false,
      error: 'Invalid protocol format'
    });
    expect(validateProtocol('123protocol:')).toEqual({
      isValid: false,
      error: 'Invalid protocol format'
    });
  });

  it('should reject protocols that do not start with a letter', () => {
    expect(validateProtocol('-protocol:')).toEqual({
      isValid: false,
      error: 'Invalid protocol format'
    });
    expect(validateProtocol('9protocol:')).toEqual({
      isValid: false,
      error: 'Invalid protocol format'
    });
  });
});

describe('Safe URL Component Update', () => {
  const testUrl = 'https://api.example.com/v1/users?page=1#section';

  it('should successfully update protocol with valid value', () => {
    const result = updateUrlComponentSafe(testUrl, 'protocol', 'ftp:');
    expect(result.success).toBe(true);
    expect(result.url).toBe('ftp://api.example.com/v1/users?page=1#section');
    expect(result.error).toBeUndefined();
  });

  it('should fail to update protocol with invalid value', () => {
    const result = updateUrlComponentSafe(testUrl, 'protocol', 'invalid-protocol');
    expect(result.success).toBe(false);
    expect(result.url).toBe(testUrl); // Original URL unchanged
    expect(result.error).toBe('Protocol must end with :');
  });

  it('should successfully update hostname with valid value', () => {
    const result = updateUrlComponentSafe(testUrl, 'hostname', 'newapi.example.com');
    expect(result.success).toBe(true);
    expect(result.url).toBe('https://newapi.example.com/v1/users?page=1#section');
    expect(result.error).toBeUndefined();
  });

  it('should fail to update hostname with invalid value', () => {
    const result = updateUrlComponentSafe(testUrl, 'hostname', 'invalid..domain.com');
    expect(result.success).toBe(false);
    expect(result.url).toBe(testUrl); // Original URL unchanged
    expect(result.error).toBe('Domain cannot contain consecutive dots');
  });

  it('should successfully update pathname with valid value', () => {
    const result = updateUrlComponentSafe(testUrl, 'pathname', '/v2/users');
    expect(result.success).toBe(true);
    expect(result.url).toBe('https://api.example.com/v2/users?page=1#section');
    expect(result.error).toBeUndefined();
  });

  it('should fail to update pathname with invalid value', () => {
    const result = updateUrlComponentSafe(testUrl, 'pathname', '/path<script>');
    expect(result.success).toBe(false);
    expect(result.url).toBe(testUrl); // Original URL unchanged
    expect(result.error).toBe('Path contains invalid characters');
  });

  it('should fail with invalid original URL', () => {
    const result = updateUrlComponentSafe('not-a-url', 'hostname', 'example.com');
    expect(result.success).toBe(false);
    expect(result.url).toBe('not-a-url');
    expect(result.error).toBe('Original URL is invalid');
  });
});