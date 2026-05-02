import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '라멘 맛집 지도',
  description:
    '라오타(RAOTA) 라멘 맛집 지도에서 전국 라멘집과 일본라멘 스타일별 맛집을 찾아보세요.',
  keywords: ['라오타', 'RAOTA', 'raota', '라멘', '일본라멘', '라멘 맛집', '라멘 지도', '라멘집'],
  alternates: {
    canonical: '/shops',
  },
  openGraph: {
    title: '라멘 맛집 지도 | 라오타 RAOTA',
    description:
      '전국 라멘 맛집과 일본라멘 스타일별 라멘집을 라오타에서 찾아보세요.',
    url: '/shops',
    images: [
      {
        url: '/header-shoplist-anime.png',
        width: 1200,
        height: 630,
        alt: '라오타 RAOTA 라멘 맛집 지도',
      },
    ],
  },
};

export default function ShopsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
