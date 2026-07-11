import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "공지사항",
  description: "라오타 RAOTA의 서비스 소식과 운영 안내를 확인하세요.",
  alternates: { canonical: "/notices" },
};

export default function NoticesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
