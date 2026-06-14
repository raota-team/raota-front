import type { Metadata } from 'next';
import LandingContent from './components/LandingContent';

export const metadata: Metadata = {
  title: {
    absolute: '라오타 - 라멘 추천 & 맛집 지도 & 전국 라멘 커뮤니티',
  },
  description:
    '라오타(RAOTA)는 전국 라멘 맛집 지도와 라멘집 추천, 실제 방문 후기를 제공하는 라멘 커뮤니티입니다. 내 취향에 맞는 라멘 맛집을 찾아보세요.',
  alternates: {
    canonical: '/',
  },
};

export default function HomePage() {
  return <LandingContent />;
}
