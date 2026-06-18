import type { Metadata } from 'next';
import LandingContent from './components/LandingContent';

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

export default function HomePage() {
  return <LandingContent />;
}
