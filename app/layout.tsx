import type { Metadata } from 'next';
import { AppProvider } from './context/AppContext';
import ClientLayout from './components/ClientLayout';
import './globals.css';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export const metadata: Metadata = {
  title: 'RAOTA - 라면 맛집 리뷰 플랫폼',
  description: '라면 맛집을 찾고 리뷰를 공유하세요',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <AppProvider>
          <ClientLayout>{children}</ClientLayout>
        </AppProvider>
      </body>
    </html>
  );
}
