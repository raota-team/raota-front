import type { Metadata } from 'next';
import LandingContent from './components/LandingContent';

export const metadata: Metadata = {
  title: {
    absolute: '라오타 - 라멘 추천 & 맛집 지도 & 전국 라멘 커뮤니티',
  },
  description:
    '라오타(RAOTA)는 완벽한 라멘 추천, 전국 라멘 맛집 지도, 매니아들의 솔직한 후기를 제공하는 대한민국 대표 라멘 커뮤니티입니다. 지금 내 취향의 라멘집을 찾아보세요.',
  alternates: {
    canonical: '/',
  },
};

export default function HomePage() {
  return <LandingContent />;
}
