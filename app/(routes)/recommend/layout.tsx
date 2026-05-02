import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '추천받기',
  description:
    '라오타(RAOTA) 추천받기에서 라멘 취향 테스트, 두 매장 비교, 커뮤니티 리뷰 요약 기능을 확인하세요.',
  keywords: ['라오타', 'RAOTA', 'raota', '라멘 추천', '라멘 취향 테스트', '라멘집 비교', '라멘 리뷰 요약'],
  alternates: {
    canonical: '/recommend',
  },
  openGraph: {
    title: '추천받기 | 라오타 RAOTA',
    description:
      '취향 테스트, 매장 비교, 리뷰 요약으로 나에게 맞는 라멘집을 찾아보세요.',
    url: '/recommend',
    images: [
      {
        url: '/header-recommend.png',
        width: 1200,
        height: 630,
        alt: '라오타 RAOTA 라멘 추천받기',
      },
    ],
  },
};

export default function RecommendLayout({ children }: { children: React.ReactNode }) {
  return children;
}
