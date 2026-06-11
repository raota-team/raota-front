import type { Metadata, Viewport } from "next";
import { GoogleTagManager } from "@next/third-parties/google";
import { AppProvider } from "./context/AppContext";
import ClientLayout from "./components/ClientLayout";
import QueryProvider from "./providers/QueryProvider";
import "./globals.css";

// 검색 엔진 최적화를 위한 기본 설정
const SITE_NAME = "라오타 RAOTA";
const SITE_TITLE = "라오타 - 라멘 추천 & 맛집 지도 & 전국 라멘 커뮤니티";
const SITE_DESCRIPTION =
  "라오타(RAOTA)는 완벽한 라멘 추천, 전국 라멘 맛집 지도, 매니아들의 솔직한 후기를 제공하는 대한민국 대표 라멘 커뮤니티입니다.";
const SITE_URL = "https://www.raota.net";
const GTM_ID = "GTM-WRH3QH6K";
const SITE_KEYWORDS = [
  "라멘 추천",
  "라멘",
  "라멘집",
  "라멘 맛집",
  "라멘 지도",
  "라멘 커뮤니티",
  "라멘집 추천",
  "전국 라멘 지도",
  "서울 라멘 맛집",
  "돈코츠라멘",
  "쇼유라멘",
  "츠케멘",
  "마제소바",
  "이에케라멘",
  "토리파이탄",
  "라오타",
  "RAOTA",
  "raota",
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "RAOTA (라오타)",
  alternateName: ["라오타", "raota", "라멘 추천", "라멘 지도", "라멘 커뮤니티"],
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  inLanguage: "ko-KR",
  publisher: {
    "@type": "Organization",
    name: "RAOTA",
    alternateName: "라오타",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [
      "https://www.instagram.com/raota_official", // 예시 SNS
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#e60000", // DESIGN.md Vodafone Red
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "라오타",
  title: {
    default: SITE_TITLE,
    template: `%s | 라오타 RAOTA`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  authors: [{ name: "RAOTA Team" }],
  creator: "RAOTA",
  publisher: "RAOTA",
  category: "food",
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
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/hero-ramen.webp", // 공유 시 보여줄 기본 이미지
        width: 1200,
        height: 630,
        alt: "라오타 RAOTA - 라멘에 진심인 사람들",
      },
    ],
  },
  // Twitter (X) 노출용
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <GoogleTagManager gtmId={GTM_ID} />
      <head>
        <link rel="preconnect" href="https://images.raota.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.raota.net" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <QueryProvider>
          <AppProvider>
            <ClientLayout>{children}</ClientLayout>
          </AppProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
