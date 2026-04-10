import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://url.computer", lastModified: new Date() },
    { url: "https://url.computer/docs", lastModified: new Date() },
    { url: "https://url.computer/about", lastModified: new Date() },
  ];
}
