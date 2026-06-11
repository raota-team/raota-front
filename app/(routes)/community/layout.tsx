import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '라멘 커뮤니티 - 솔직한 후기 및 맛집 꿀팁',
  description:
    '라오타(RAOTA) 라멘 커뮤니티에서 라멘에 진심인 사람들이 남긴 라멘 후기, 맛집 추천, 웨이팅 정보, 라멘 꿀팁을 확인하세요.',
  keywords: ['라멘 커뮤니티', '라멘 후기', '라멘집 추천', '라멘 추천', '라오타', '라멘 맛집'],
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
