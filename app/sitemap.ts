import { MetadataRoute } from 'next';

const baseUrl = 'https://www.raota.net';
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

type SitemapShop = {
  id: number | string;
};

type RamenShopsResponse = {
  data?: {
    items?: SitemapShop[];
    page?: {
      totalPages?: number;
      totalPage?: number;
    };
  };
};

const fetchShopPage = async (page: number) => {
  if (!apiBaseUrl) return { shops: [], totalPages: 1 };

  const params = new URLSearchParams({
    page: String(page),
    size: '100',
    sort: 'NAME',
  });
  const response = await fetch(`${apiBaseUrl}/ramen-shops?${params.toString()}`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ramen shops for sitemap: ${response.status}`);
  }

  const payload = (await response.json()) as RamenShopsResponse;
  return {
    shops: payload.data?.items ?? [],
    totalPages: payload.data?.page?.totalPages ?? payload.data?.page?.totalPage ?? 1,
  };
};

const getShopSitemapEntries = async (): Promise<MetadataRoute.Sitemap> => {
  try {
    const firstPage = await fetchShopPage(0);
    const totalPages = firstPage.totalPages;
    const remainingPages = Array.from({ length: Math.max(totalPages - 1, 0) }, (_, index) => index + 1);
    const remainingResults = await Promise.all(
      remainingPages.map((page) => fetchShopPage(page)),
    );
    const shops = [firstPage, ...remainingResults].flatMap((result) => result.shops);
    const uniqueShopIds = Array.from(
      new Set(
        shops
          .map((shop) => Number(shop.id))
          .filter((id) => Number.isFinite(id)),
      ),
    );

    return uniqueShopIds.map((shopId) => ({
      url: `${baseUrl}/shop/${shopId}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Failed to build shop sitemap entries:', error);
    return [];
  }
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const shopUrls = await getShopSitemapEntries();

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
      url: `${baseUrl}/recommend`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/community`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.9,
    },
    ...shopUrls,
  ];
}
