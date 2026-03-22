import type { Metadata } from "next";
import { AppProvider } from "./context/AppContext";
import ClientLayout from "./components/ClientLayout";
import QueryProvider from "./providers/QueryProvider";
import "./globals.css";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export const metadata: Metadata = {
  title: "RAOTA - 라멘의 모든 것",
  description: "라면 맛집을 찾고 리뷰를 공유하세요",
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
    <html lang="ko">
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
