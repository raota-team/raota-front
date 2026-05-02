import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '라멘 커뮤니티',
  description:
    '라오타(RAOTA) 라멘 커뮤니티에서 라멘에 진심인 사람들이 남긴 일본라멘 후기, 맛집 추천, 라멘 꿀팁을 확인하세요.',
  keywords: ['라오타', 'RAOTA', 'raota', '라멘', '일본라멘', '라멘 후기', '라멘 커뮤니티', '라멘 추천'],
  alternates: {
    canonical: '/community',
  },
  openGraph: {
    title: '라멘 커뮤니티 | 라오타 RAOTA',
    description:
      '라멘에 진심인 사람들이 남긴 후기, 맛집 추천, 라멘 꿀팁을 확인하세요.',
    url: '/community',
    images: [
      {
        url: '/header-community-anime.png',
        width: 1200,
        height: 630,
        alt: '라오타 RAOTA 라멘 커뮤니티',
      },
    ],
  },
};

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
