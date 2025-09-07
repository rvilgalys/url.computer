import {
  parseUrl,
  isValidUrl,
  buildUrl,
  updateUrlComponent,
  addQueryParam,
  removeQueryParam,
  searchParamsToObject,
  objectToSearchParams,
} from '../../lib/url';

describe('URL Utilities', () => {
  const validUrl = 'https://api.example.com/v1/users?page=1&sort=name#profile';
  const invalidUrl = 'not-a-valid-url';

  describe('parseUrl', () => {
    it('should parse a valid URL correctly', () => {
      const parsed = parseUrl(validUrl);
      
      expect(parsed.isValid).toBe(true);
      expect(parsed.protocol).toBe('https:');
      expect(parsed.hostname).toBe('api.example.com');
      expect(parsed.pathname).toBe('/v1/users');
      expect(parsed.hash).toBe('#profile');
      expect(parsed.searchParams.get('page')).toBe('1');
      expect(parsed.searchParams.get('sort')).toBe('name');
    });

    it('should handle invalid URLs gracefully', () => {
      const parsed = parseUrl(invalidUrl);
      
      expect(parsed.isValid).toBe(false);
      expect(parsed.protocol).toBe('');
      expect(parsed.hostname).toBe('');
      expect(parsed.pathname).toBe('');
      expect(parsed.hash).toBe('');
      expect(parsed.searchParams.toString()).toBe('');
    });

    it('should handle URLs without query params or hash', () => {
      const simpleUrl = 'https://example.com/path';
      const parsed = parseUrl(simpleUrl);
      
      expect(parsed.isValid).toBe(true);
      expect(parsed.protocol).toBe('https:');
      expect(parsed.hostname).toBe('example.com');
      expect(parsed.pathname).toBe('/path');
      expect(parsed.hash).toBe('');
      expect(parsed.searchParams.toString()).toBe('');
    });
  });

  describe('isValidUrl', () => {
    it('should return true for valid URLs', () => {
      expect(isValidUrl(validUrl)).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('ftp://files.example.com')).toBe(true);
    });

    it('should return false for invalid URLs', () => {
      expect(isValidUrl(invalidUrl)).toBe(false);
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl('just-text')).toBe(false);
    });
  });

  describe('buildUrl', () => {
    it('should reconstruct a URL from parsed components', () => {
      const parsed = parseUrl(validUrl);
      const rebuilt = buildUrl(parsed);
      
      expect(rebuilt).toBe(validUrl);
    });

    it('should handle missing optional components', () => {
      const minimal = {
        protocol: 'https:',
        hostname: 'example.com',
        pathname: '/test',
        searchParams: new URLSearchParams(),
        hash: '',
        isValid: true,
      };
      
      const result = buildUrl(minimal);
      expect(result).toBe('https://example.com/test');
    });

    it('should return empty string for missing required components', () => {
      const invalid = {
        protocol: '',
        hostname: 'example.com',
      };
      
      const result = buildUrl(invalid);
      expect(result).toBe('');
    });
  });

  describe('updateUrlComponent', () => {
    it('should update protocol', () => {
      const result = updateUrlComponent(validUrl, 'protocol', 'http:');
      expect(result).toContain('http://api.example.com');
    });

    it('should update hostname', () => {
      const result = updateUrlComponent(validUrl, 'hostname', 'newapi.example.com');
      expect(result).toContain('newapi.example.com');
    });

    it('should update pathname', () => {
      const result = updateUrlComponent(validUrl, 'pathname', '/v2/posts');
      expect(result).toContain('/v2/posts');
    });

    it('should update hash', () => {
      const result = updateUrlComponent(validUrl, 'hash', '#settings');
      expect(result).toContain('#settings');
    });

    it('should return original URL if invalid', () => {
      const result = updateUrlComponent(invalidUrl, 'protocol', 'https:');
      expect(result).toBe(invalidUrl);
    });
  });

  describe('addQueryParam', () => {
    it('should add a new query parameter', () => {
      const result = addQueryParam('https://example.com', 'key', 'value');
      expect(result).toBe('https://example.com/?key=value');
    });

    it('should replace existing query parameter', () => {
      const result = addQueryParam(validUrl, 'page', '2');
      expect(result).toContain('page=2');
      expect(result).not.toContain('page=1');
    });

    it('should handle invalid URLs', () => {
      const result = addQueryParam(invalidUrl, 'key', 'value');
      expect(result).toBe(invalidUrl);
    });
  });

  describe('removeQueryParam', () => {
    it('should remove an existing query parameter', () => {
      const result = removeQueryParam(validUrl, 'page');
      expect(result).not.toContain('page=1');
      expect(result).toContain('sort=name'); // Should keep other params
    });

    it('should handle non-existent parameters gracefully', () => {
      const result = removeQueryParam(validUrl, 'nonexistent');
      expect(result).toBe(validUrl);
    });

    it('should handle invalid URLs', () => {
      const result = removeQueryParam(invalidUrl, 'key');
      expect(result).toBe(invalidUrl);
    });
  });

  describe('searchParamsToObject', () => {
    it('should convert URLSearchParams to plain object', () => {
      const params = new URLSearchParams('page=1&sort=name&filter=active');
      const obj = searchParamsToObject(params);
      
      expect(obj).toEqual({
        page: '1',
        sort: 'name',
        filter: 'active',
      });
    });

    it('should handle empty URLSearchParams', () => {
      const params = new URLSearchParams();
      const obj = searchParamsToObject(params);
      
      expect(obj).toEqual({});
    });
  });

  describe('objectToSearchParams', () => {
    it('should convert plain object to URLSearchParams', () => {
      const obj = { page: '1', sort: 'name', filter: 'active' };
      const params = objectToSearchParams(obj);
      
      expect(params.get('page')).toBe('1');
      expect(params.get('sort')).toBe('name');
      expect(params.get('filter')).toBe('active');
    });

    it('should handle empty object', () => {
      const obj = {};
      const params = objectToSearchParams(obj);
      
      expect(params.toString()).toBe('');
    });

    it('should skip undefined values', () => {
      const obj = { page: '1', sort: undefined as any, filter: 'active' };
      const params = objectToSearchParams(obj);
      
      expect(params.get('page')).toBe('1');
      expect(params.get('sort')).toBeNull();
      expect(params.get('filter')).toBe('active');
    });
  });
});