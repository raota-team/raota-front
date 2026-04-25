import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://raota.net';

  // 나중에 여기서 API를 호출해 모든 shopId와 postId를 가져와 목록에 추가할 수 있습니다.
  // const shops = await getShops();
  // const shopUrls = shops.map(shop => ({ url: `${baseUrl}/shop/${shop.id}`, lastModified: new Date() }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/shops`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/community`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.9,
    },
  ];
}
