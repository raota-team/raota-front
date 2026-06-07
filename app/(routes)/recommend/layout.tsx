import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "라멘 추천",
  description:
    "라오타(RAOTA) 라멘 추천에서 취향, 기분, 선호하는 국물 스타일에 맞는 라멘 맛집과 일본라멘 메뉴를 찾아보세요.",
  keywords: [
    "라멘 추천",
    "라멘 맛집 추천",
    "일본라멘 추천",
    "라멘 취향 추천",
    "라오타",
    "RAOTA",
    "라멘",
    "라멘 지도",
  ],
  alternates: {
    canonical: "/recommend",
  },
  openGraph: {
    title: "라멘 추천 | 라오타 RAOTA",
    description:
      "취향과 기분에 맞는 라멘 맛집, 일본라멘 스타일, 추천 메뉴를 라오타에서 찾아보세요.",
    url: "/recommend",
    images: [
      {
        url: "/header-recommend.png",
        width: 1200,
        height: 630,
        alt: "라오타 RAOTA 라멘 추천",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "라멘 추천 | 라오타 RAOTA",
    description:
      "취향과 기분에 맞는 라멘 맛집과 일본라멘 메뉴를 추천받아보세요.",
    images: ["/header-recommend.png"],
  },
};

export default function RecommendLayout({ children }: { children: React.ReactNode }) {
  return children;
}
