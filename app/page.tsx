import type { Metadata } from 'next';
import LandingContent, { type HomeInitialData } from './components/LandingContent';

export const metadata: Metadata = {
  title: {
    absolute: '라오타 - 내 라멘 취향을 기록하고 다음 라멘집을 고르는 서비스',
  },
  description:
    '라오타(RAOTA)는 가고 싶은 라멘집과 다녀온 라멘집을 모아두고, 국물·면·토핑·재방문 의사로 나만의 라멘 취향을 쌓아가는 서비스입니다.',
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
  const [stats, recentShops] = await Promise.all([
    fetchPublicHomeData<HomeInitialData['stats']>('/api/v1/discovery/stats', 300),
    fetchPublicHomeData<HomeInitialData['recentShops']>('/api/v1/shops/recent-verified?limit=4', 60),
  ]);

  return (
    <LandingContent
      initialData={{ stats, recentShops }}
    />
  );
}
