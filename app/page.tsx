import type { Metadata } from 'next';
import LandingContent from './components/LandingContent';
import { getRecentRamenLogShops } from '@/lib/api/ramen-logs';

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

export default async function HomePage() {
  // 서버에서 실패하면 브라우저가 다시 불러온다
  const recentShops = await getRecentRamenLogShops(4, { revalidate: 60 }).catch(() => undefined);

  return (
    <LandingContent
      initialData={{ recentShops }}
    />
  );
}
