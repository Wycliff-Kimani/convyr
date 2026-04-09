import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://convyr.com',
      lastModified: new Date(),
    }
  ];
}
