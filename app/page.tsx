import type { Metadata } from 'next';
import LandingContent, { type HomeInitialData } from './components/LandingContent';

export const metadata: Metadata = {
  title: {
    absolute: '라오타 - 라멘의 모든 것을 기록하고 나누는 커뮤니티',
  },
  description:
    '라오타(RAOTA)는 전국 라멘 가게와 메뉴를 찾고, 한 그릇의 취향을 기록하며, 라멘 이야기를 함께 나누는 커뮤니티입니다.',
  alternates: {
    canonical: '/',
  },
};

const fetchPublicHomeData = async <T,>(
  path: string,
  revalidate: number,
): Promise<T | undefined> => {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBaseUrl) return undefined;

  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      next: { revalidate },
    });

    if (!response.ok) return undefined;
    return await response.json() as T;
  } catch {
    return undefined;
  }
};

export default async function HomePage() {
  const [stats, recentShops, weekendRecommendations] = await Promise.all([
    fetchPublicHomeData<HomeInitialData['stats']>('/api/v1/discovery/stats', 300),
    fetchPublicHomeData<HomeInitialData['recentShops']>('/api/v1/shops/recent-verified?limit=4', 60),
    fetchPublicHomeData<HomeInitialData['weekendRecommendations']>(
      '/api/v1/discovery/today-recommendations',
      3600,
    ),
  ]);

  return (
    <LandingContent
      initialData={{ stats, recentShops, weekendRecommendations }}
    />
  );
}
