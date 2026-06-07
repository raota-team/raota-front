import type { Metadata, Viewport } from "next";
import { GoogleTagManager } from "@next/third-parties/google";
import { AppProvider } from "./context/AppContext";
import ClientLayout from "./components/ClientLayout";
import MixpanelInitializer from "./components/MixpanelInitializer";
import QueryProvider from "./providers/QueryProvider";
import "./globals.css";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// 검색 엔진 최적화를 위한 기본 설정
const SITE_NAME = "라오타 RAOTA";
const SITE_TITLE = "라오타 - 라멘에 진심인 사람들";
const SITE_DESCRIPTION =
  "라오타(RAOTA)는 라멘에 진심인 사람들이 모여 국내 라멘 맛집, 일본라멘 스타일, 솔직한 후기와 라멘 지도를 기록하는 라멘 커뮤니티입니다.";
const SITE_URL = "https://raota.net";
const GTM_ID = "GTM-WRH3QH6K";
const SITE_KEYWORDS = [
  "raota",
  "RAOTA",
  "라오타",
  "라멘",
  "일본라멘",
  "라멘 맛집",
  "라멘맛집",
  "라멘 지도",
  "라멘지도",
  "라멘 커뮤니티",
  "라멘 후기",
  "돈코츠라멘",
  "쇼유라멘",
  "츠케멘",
  "마제소바",
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "RAOTA",
  alternateName: ["라오타", "raota", SITE_TITLE],
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  inLanguage: "ko-KR",
  publisher: {
    "@type": "Organization",
    name: "RAOTA",
    alternateName: "라오타",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>
        <MixpanelInitializer />
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
