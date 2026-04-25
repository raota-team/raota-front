import type { Metadata, Viewport } from "next";
import { AppProvider } from "./context/AppContext";
import ClientLayout from "./components/ClientLayout";
import QueryProvider from "./providers/QueryProvider";
import "./globals.css";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// 검색 엔진 최적화를 위한 기본 설정
const SITE_NAME = "RAOTA (라오타)";
const SITE_DESCRIPTION = "라멘 매니아들을 위한 국내 최대 라멘 맛집 아카이브. 생생한 후기와 나만의 라멘 지도를 만들어보세요.";
const SITE_URL = "https://raota.net"; // 실제 배포 주소로 변경 필요

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#dc2626", // 브랜드 컬러 (Red-600)
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - 라멘의 모든 것`,
    template: `%s | ${SITE_NAME}`,
  },
  description: "전국 라멘 맛집 지도부터 매니아들의 솔직한 후기까지. '오늘 어디 라멘 먹으러 가지?' 고민될 땐 RAOTA에서 진짜 맛집을 찾아보세요.",
  keywords: ["라멘", "라멘맛집", "어디 라멘", "라멘 커뮤니티", "일본라멘", "돈코츠라멘", "츠케멘", "마제소바", "라멘지도", "라멘후기", "RAOTA", "라오타"],
  authors: [{ name: "RAOTA Team" }],
  creator: "RAOTA",
  publisher: "RAOTA",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // Open Graph (네이버, 카카오톡, 페이스북 노출용)
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/hero-ramen.webp", // 공유 시 보여줄 기본 이미지
        width: 1200,
        height: 630,
        alt: "RAOTA - 라멘의 모든 것",
      },
    ],
  },
  // Twitter (X) 노출용
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/hero-ramen.webp"],
  },
  // 검색 엔진 로봇 설정
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  verification: {
    // 실제 등록 시 네이버/구글 콘솔에서 받은 코드를 여기에 넣으면 더 빨리 수집됩니다.
    google: "google-site-verification-code", 
    other: {
      "naver-site-verification": "naver-site-verification-code",
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* 추가적인 SEO 팁: 캐노니컬 URL 강제 */}
        <link rel="canonical" href={SITE_URL} />
      </head>
      <body>
        <QueryProvider>
          <AppProvider>
            <ClientLayout>{children}</ClientLayout>
          </AppProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
