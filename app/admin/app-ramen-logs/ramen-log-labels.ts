import type { AdminV2RamenLogRow, AdminV2RamenLogState, AdminV2RamenLogVisibility, AdminV2RevisitIntention } from "@/lib/api/admin-v2";

export const visibilityLabels: Record<AdminV2RamenLogVisibility, string> = { PUBLIC: "공개", PRIVATE: "비공개" };
export const stateLabels: Record<AdminV2RamenLogState, string> = { LIVE: "게시 중", DELETED: "삭제됨", ALL: "전체" };
// 앱(raota-app)과 같은 문구를 써야 운영자가 사용자 화면과 같은 말로 이해한다.
export const revisitLabels: Record<AdminV2RevisitIntention, string> = { OFTEN: "자주 감", SOMETIMES: "가끔 생각남", ONCE_IS_ENOUGH: "한번이면 충분" };
export const tasteCategoryLabels: Record<string, string> = { BROTH: "국물", NOODLE: "면", SEASONING: "간", TOPPING: "토핑" };
// 비공개 기록은 관리자만 볼 수 있으므로 한눈에 구분되게 진하게 표시한다.
export const visibilityBadgeClass: Record<AdminV2RamenLogVisibility, string> = {
  PUBLIC: "bg-stone-100 text-stone-600",
  PRIVATE: "bg-[#25282b] text-white",
};

export function formatDateTime(value: string | null) {
  return value ? new Date(value).toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" }) : "–";
}

// 탈퇴 등으로 닉네임이 없으면 서버가 null을 보낸다.
export function authorLabel(author: AdminV2RamenLogRow["author"]) {
  return author.nickname || `회원 #${author.id}`;
}

export function shopLabel(shop: AdminV2RamenLogRow["shop"]) {
  if (!shop.name) return `매장 #${shop.id}`;
  return shop.branchName ? `${shop.name} · ${shop.branchName}` : shop.name;
}
