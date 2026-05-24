import { BarChart3, MessageSquareText, Sparkles } from "lucide-react";
import type { ModeId, ShopOption } from "./types";
import type { Shop } from "@/app/types";

export const modes: Array<{
  id: ModeId;
  label: string;
  mobileLabel: string;
  icon: typeof Sparkles;
}> = [
  {
    id: "taste",
    label: "취향 추천",
    mobileLabel: "취향 추천",
    icon: Sparkles,
  },
  {
    id: "compare",
    label: "매장 비교",
    mobileLabel: "매장 비교",
    icon: BarChart3,
  },
  {
    id: "summary",
    label: "리뷰 요약",
    mobileLabel: "리뷰 요약",
    icon: MessageSquareText,
  },
];

export const modePrompts: Record<
  ModeId,
  {
    label: string;
    intro: string;
    helper: string;
    resultHelper: string;
    totalSteps: number;
  }
> = {
  taste: {
    label: "취향 질문",
    intro: "취향을 알려주세요.",
    helper: "지금 먹고 싶은 라멘에 가까운 답을 골라보세요.",
    resultHelper: "입력한 취향 기준으로 잘 맞는 후보를 정리했습니다.",
    totalSteps: 4,
  },
  compare: {
    label: "비교 설정",
    intro: "두 매장을 비교해보세요.",
    helper: "궁금한 두 곳과 비교 관점을 입력해보세요.",
    resultHelper: "고른 두 매장을 같은 기준으로 비교했습니다.",
    totalSteps: 1,
  },
  summary: {
    label: "요약 설정",
    intro: "리뷰를 요약해보세요.",
    helper: "매장과 궁금한 점을 입력하면 핵심을 정리합니다.",
    resultHelper: "선택한 매장을 요약해서 보기 쉽게 정리했습니다.",
    totalSteps: 1,
  },
};

export const tasteOptions = {
  soup: ["돈코츠", "쇼유", "미소", "시오", "츠케멘", "탄탄멘"],
  mood: ["혼밥", "데이트", "빠른 식사", "웨이팅 감수"],
  priority: ["진한 국물", "자가제면", "차슈", "깔끔한 맛"],
};

export const compareFocusExamples = ["혼밥하기 좋은 곳", "웨이팅 적은 곳", "국물이 더 진한 곳", "데이트로 갈만한 곳"];
export const summaryFocusExamples = ["주말 웨이팅", "대표 메뉴 추천", "혼자 가도 괜찮은지", "매운 메뉴 있는지"];
export const tasteFocusExamples = ["양이 많은 곳", "토핑이 다양한 곳", "매운맛 조절 가능한 곳", "사이드 메뉴가 맛있는 곳"];

export const fallbackShopOptions: ShopOption[] = [
  { id: 1, name: "멘야 하루", region: "서울 마포구" },
  { id: 2, name: "라멘 아오이", region: "서울 성동구" },
  { id: 3, name: "코하쿠 라멘", region: "서울 종로구" },
  { id: 4, name: "시오노미", region: "서울 용산구" },
];

export const shops: Shop[] = [
  {
    id: 1,
    name: "멘야 하루",
    location: "서울 마포구",
    address: "서울 마포구",
    type: "돈코츠",
    editorRating: 4.7,
    userRating: 4.6,
    description: "진한 국물과 차슈 구성이 강점인 후보입니다.",
    imageUrl: "/hero-home.jpg",
    menus: [{ name: "특제 돈코츠 라멘", votes: 24 }],
    menu_list: [],
    event_menus: [],
    userPhotos: [],
    business_hours: {
      closed_days: "정보 없음",
      open_time: "정보 없음",
      close_time: "정보 없음",
      break_start: null,
      break_end: null,
      parking_info: "정보 없음",
    },
    stats: { visit_count: 128, bookmark_count: 0 },
    instagram_url: "",
    catchTableUrl: "",
    isBookmarked: false,
  },
  {
    id: 2,
    name: "라멘 아오이",
    location: "서울 성동구",
    address: "서울 성동구",
    type: "쇼유",
    editorRating: 4.5,
    userRating: 4.4,
    description: "깔끔한 국물과 안정적인 회전율이 장점인 후보입니다.",
    imageUrl: "/header-recommend.png",
    menus: [{ name: "아지타마 쇼유 라멘", votes: 19 }],
    menu_list: [],
    event_menus: [],
    userPhotos: [],
    business_hours: {
      closed_days: "정보 없음",
      open_time: "정보 없음",
      close_time: "정보 없음",
      break_start: null,
      break_end: null,
      parking_info: "정보 없음",
    },
    stats: { visit_count: 96, bookmark_count: 0 },
    instagram_url: "",
    catchTableUrl: "",
    isBookmarked: false,
  },
  {
    id: 3,
    name: "코하쿠 라멘",
    location: "서울 종로구",
    address: "서울 종로구",
    type: "미소",
    editorRating: 4.4,
    userRating: 4.3,
    description: "구수한 미소 베이스와 부드러운 계란 토핑이 잘 맞는 조용한 라멘집입니다.",
    imageUrl: "/header-shoplist-anime.png",
    menus: [{ name: "아지타마 미소 라멘", votes: 16 }],
    menu_list: [],
    event_menus: [],
    userPhotos: [],
    business_hours: {
      closed_days: "월요일",
      open_time: "11:30",
      close_time: "21:00",
      break_start: "15:00",
      break_end: "17:00",
      parking_info: "주차 불가",
    },
    stats: { visit_count: 84, bookmark_count: 0 },
    instagram_url: "",
    catchTableUrl: "",
    isBookmarked: false,
  },
  {
    id: 4,
    name: "시오노미",
    location: "서울 용산구",
    address: "서울 용산구",
    type: "시오",
    editorRating: 4.3,
    userRating: 4.2,
    description: "담백한 시오 국물과 가벼운 식사 흐름이 좋아 첫 방문자에게 부담이 적습니다.",
    imageUrl: "/header-community-v2.jpg",
    menus: [{ name: "특제 시오 라멘", votes: 13 }],
    menu_list: [],
    event_menus: [],
    userPhotos: [],
    business_hours: {
      closed_days: "정보 없음",
      open_time: "11:00",
      close_time: "20:30",
      break_start: null,
      break_end: null,
      parking_info: "인근 공영주차장",
    },
    stats: { visit_count: 72, bookmark_count: 0 },
    instagram_url: "",
    catchTableUrl: "",
    isBookmarked: false,
  },
];

export const modeCopy: Record<ModeId, { action: string; result: string }> = {
  taste: {
    action: "추천 받기",
    result: "입력한 취향 기준 결과입니다.",
  },
  compare: {
    action: "비교하기",
    result: "선택한 두 매장 비교 결과입니다.",
  },
  summary: {
    action: "요약하기",
    result: "선택한 매장 요약 결과입니다.",
  },
};

export const compareAxes = ["국물", "면", "토핑", "분위기", "접근성", "재방문"];
