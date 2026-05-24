import type { Metadata } from 'next';
import LandingContent from './components/LandingContent';

export const metadata: Metadata = {
  title: {
    absolute: '라오타 - 라멘에 진심인 사람들',
  },
  description:
    '라오타(RAOTA) 라멘 커뮤니티에서 전국 라멘 맛집, 일본라멘 스타일, 매니아들의 솔직한 라멘 후기를 찾아보세요.',
  alternates: {
    canonical: '/',
  },
};

export default function HomePage() {
  return <LandingContent />;
}
