import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '라멘 로그 - 유저들의 한 그릇 기록',
  description: '라오타 유저들이 남긴 라멘 노트와 한 그릇 기록을 모아보세요.',
  alternates: {
    canonical: '/ramen-log',
  },
  openGraph: {
    title: '라멘 로그 | 라오타 RAOTA',
    description: '라오타 유저들의 라멘 취향 기록과 인증 사진을 둘러보세요.',
    url: '/ramen-log',
    images: [
      {
        url: '/hero-ramen.webp',
        width: 1200,
        height: 630,
        alt: '라오타 RAOTA 라멘 로그',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '라멘 로그 | 라오타 RAOTA',
    description: '유저들이 남긴 한 그릇 기록을 둘러보세요.',
    images: ['/hero-ramen.webp'],
  },
};

export default function RamenLogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
