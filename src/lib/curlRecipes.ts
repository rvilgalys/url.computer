import { CurlOptions } from "../types";

export interface Recipe {
  label: string;
  action: (s: CurlOptions) => CurlOptions;
  undo: (s: CurlOptions) => CurlOptions;
  isActive: (s: CurlOptions) => boolean;
}

export const recipes: Recipe[] = [
  {
    label: "Verbose (-v)",
    action: (s: CurlOptions) => {
      if (s.options.includes("-v")) return s;
      return { ...s, options: [...s.options, "-v"] };
    },
    undo: (s: CurlOptions) => ({
      ...s,
      options: s.options.filter((o) => o !== "-v"),
    }),
    isActive: (s: CurlOptions) => s.options.includes("-v"),
  },
  {
    label: "JSON Body",
    action: (s: CurlOptions) => ({
      ...s,
      method: "POST",
      headers: { ...s.headers, "Content-Type": "application/json" },
      body: '{\n  "key": "value"\n}',
    }),
    undo: (s: CurlOptions) => {
      const newHeaders = { ...s.headers };
      delete newHeaders["Content-Type"];
      return { ...s, headers: newHeaders, body: "" };
    },
    isActive: (s: CurlOptions) =>
      s.method === "POST" && s.headers["Content-Type"] === "application/json",
  },
  {
    label: "User Agent",
    action: (s: CurlOptions) => {
      const newOptions = s.options.filter((o) => !o.startsWith("-A"));
      return {
        ...s,
        options: [...newOptions, "-A 'cURL (url.computer)'"],
      };
    },
    undo: (s: CurlOptions) => ({
      ...s,
      options: s.options.filter((o) => !o.startsWith("-A")),
    }),
    isActive: (s: CurlOptions) => s.options.some((o) => o.startsWith("-A")),
  },
  {
    label: "Multipart Form",
    action: (s: CurlOptions) => ({
      ...s,
      method: "POST",
      headers: {
        ...s.headers,
        "Content-Type": "multipart/form-data; boundary=---boundary",
      },
      body: `-----boundary\nContent-Disposition: form-data; name="field1"\n\nvalue1\n-----boundary\nContent-Disposition: form-data; name="file"; filename="example.txt"\n\nFile contents here\n-----boundary--`,
    }),
    undo: (s: CurlOptions) => {
      const newHeaders = { ...s.headers };
      delete newHeaders["Content-Type"];
      return { ...s, headers: newHeaders, body: "" };
    },
    isActive: (s: CurlOptions) =>
      s.method === "POST" &&
      !!s.headers["Content-Type"]?.includes("multipart/form-data"),
  },
  {
    label: "Bearer Token",
    action: (s: CurlOptions) => ({
      ...s,
      headers: { ...s.headers, Authorization: "Bearer YOUR_TOKEN" },
    }),
    undo: (s: CurlOptions) => {
      const newHeaders = { ...s.headers };
      delete newHeaders["Authorization"];
      return { ...s, headers: newHeaders };
    },
    isActive: (s: CurlOptions) =>
      !!s.headers["Authorization"]?.startsWith("Bearer"),
  },
  {
    label: "Basic Auth",
    action: (s: CurlOptions) => {
      if (s.options.some((o) => o.startsWith("-u"))) return s;
      return { ...s, options: [...s.options, "-u 'username:password'"] };
    },
    undo: (s: CurlOptions) => ({
      ...s,
      options: s.options.filter((o) => !o.startsWith("-u")),
    }),
    isActive: (s: CurlOptions) => s.options.some((o) => o.startsWith("-u")),
  },
  {
    label: "SSH Key",
    action: (s: CurlOptions) => {
      if (s.options.some((o) => o.startsWith("--key"))) return s;
      return { ...s, options: [...s.options, "--key 'private_key.pem'"] };
    },
    undo: (s: CurlOptions) => ({
      ...s,
      options: s.options.filter((o) => !o.startsWith("--key")),
    }),
    isActive: (s: CurlOptions) => s.options.some((o) => o.startsWith("--key")),
  },
  {
    label: "Output to File (-O)",
    action: (s: CurlOptions) => {
      if (s.options.includes("-O")) return s;
      return { ...s, options: [...s.options, "-O"] };
    },
    undo: (s: CurlOptions) => ({
      ...s,
      options: s.options.filter((o) => o !== "-O"),
    }),
    isActive: (s: CurlOptions) => s.options.includes("-O"),
  },
  {
    label: "Follow Redirects (-L)",
    action: (s: CurlOptions) => {
      if (s.options.includes("-L")) return s;
      return { ...s, options: [...s.options, "-L"] };
    },
    undo: (s: CurlOptions) => ({
      ...s,
      options: s.options.filter((o) => o !== "-L"),
    }),
    isActive: (s: CurlOptions) => s.options.includes("-L"),
  },
  {
    label: "Insecure (-k)",
    action: (s: CurlOptions) => {
      if (s.options.includes("-k")) return s;
      return { ...s, options: [...s.options, "-k"] };
    },
    undo: (s: CurlOptions) => ({
      ...s,
      options: s.options.filter((o) => o !== "-k"),
    }),
    isActive: (s: CurlOptions) => s.options.includes("-k"),
  },
  {
    label: "Proxy",
    action: (s: CurlOptions) => {
      if (s.options.some((o) => o.startsWith("-x"))) return s;
      return { ...s, options: [...s.options, "-x 'proxy:123'"] };
    },
    undo: (s: CurlOptions) => ({
      ...s,
      options: s.options.filter((o) => !o.startsWith("-x")),
    }),
    isActive: (s: CurlOptions) => s.options.some((o) => o.startsWith("-x")),
  },
  {
    label: "Cookies",
    action: (s: CurlOptions) => {
      if (s.options.some((o) => o.startsWith("-b"))) return s;
      return { ...s, options: [...s.options, "-b 'name=value'"] };
    },
    undo: (s: CurlOptions) => ({
      ...s,
      options: s.options.filter((o) => !o.startsWith("-b")),
    }),
    isActive: (s: CurlOptions) => s.options.some((o) => o.startsWith("-b")),
  },
];
