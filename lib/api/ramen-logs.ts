import { mobileApiClient } from "@/lib/api/client";

/**
 * 라멘로그는 앱과 같은 서버 API(v2, `/api/v2/ramen-logs`)를 읽는다.
 * 웹 로그인 토큰으로는 v2를 쓸 수 없어 공개 기록만 비로그인으로 읽고, 기록·공감·댓글 쓰기·수정·삭제는 앱에서 한다.
 */

export type RamenLogSort = "LATEST" | "LIKES";
export type RamenLogRevisit = "OFTEN" | "SOMETIMES" | "ONCE_IS_ENOUGH";
export type RamenLogRevisitLabel = "자주 감" | "가끔 생각남" | "한번이면 충분";
export type TasteNoteKey = "broth" | "noodle" | "seasoning" | "topping";
export type TasteNotes = Record<TasteNoteKey, string[]>;

/** 앱 기록 화면과 같은 라멘 종류(라운지 필터 순서) */
export const RAMEN_LOG_TYPES = [
  "쇼유",
  "돈코츠",
  "이에케",
  "시오",
  "미소",
  "토리파이탄",
  "니보시",
  "지로",
  "츠케멘",
  "탄탄멘",
  "마제소바",
  "아부라소바",
  "기타",
] as const;

/** 맛 태그 코드(BROTH_01…)의 분류와 이름표. 서버 MobileTasteNote와 같은 순서다 */
export const TASTE_NOTE_GROUPS: Array<{ key: TasteNoteKey; label: string; code: string; options: string[] }> = [
  { key: "broth", label: "국물", code: "BROTH", options: ["진해요", "깔끔해요", "감칠맛 좋아요", "기름져요", "어패류 향"] },
  { key: "noodle", label: "면", code: "NOODLE", options: ["탄력 있어요", "단단해요", "부드러워요", "국물이 잘 배어요", "양 많아요"] },
  { key: "seasoning", label: "간", code: "SEASONING", options: ["딱 좋아요", "슴슴해요", "짭짤해요", "매콤해요", "밥 생각나요"] },
  { key: "topping", label: "토핑", code: "TOPPING", options: ["차슈 좋아요", "계란 좋아요", "멘마 좋아요", "파 향 좋아요", "구성 알차요"] },
];

/** 앱 기록의 5축 점수(1~5). 웹에서 앱으로 옮겨 온 옛 기록은 없다(null) */
export interface RamenLogScores {
  satisfaction: number;
  brothDensity: number;
  noodleFirmness: number;
  topping: number;
  revisit: number;
}

interface MobileRamenLogAuthor {
  id: string | null;
  nickname: string | null;
  avatarUrl: string | null;
  logCount: number;
}

interface MobileRamenLogSummary {
  id: string;
  author: MobileRamenLogAuthor;
  shop: { id: string; name: string; branchName: string | null; region: string | null };
  menuName: string;
  ramenType: string;
  visitedAt: string;
  imageUrls: string[] | null;
  note: string | null;
  tasteNoteCodes: string[] | null;
  revisitIntention: RamenLogRevisit;
  visibility: "PUBLIC" | "PRIVATE";
  scores: RamenLogScores | null;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isMine: boolean;
  createdAt: string;
}

interface MobileRamenLogComment {
  id: string;
  logId: string;
  author: MobileRamenLogAuthor;
  content: string;
  createdAt: string;
  isMine: boolean;
}

interface MobileRamenLogDetail extends MobileRamenLogSummary {
  updatedAt: string;
  commentsPreview: MobileRamenLogComment[] | null;
  commentsNextCursor: string | null;
}

interface CursorPage<T> {
  items: T[] | null;
  nextCursor: string | null;
  hasNext: boolean;
}

export interface RamenLogAuthor {
  /**
   * 웹 프로필(`/user/{id}`) ID. 웹 프로필이 없는 회원은 null이다:
   * 탈퇴한 회원(서버가 id를 주지 않음)과 앱에서만 가입한 회원(ID가 APP_ONLY_MEMBER_ID_START 이상).
   */
  profileId: number | null;
  name: string;
  imageUrl?: string;
}

export interface RamenLog {
  id: number;
  author: RamenLogAuthor;
  shop: { id: number; name: string; location?: string };
  menuName: string;
  ramenType: string;
  /** 대표 사진(첫 장). 사진이 없으면 null */
  imageUrl: string | null;
  /** 최대 3장 */
  imageUrls: string[];
  /** 방문일(YYYY-MM-DD) */
  date: string;
  note: string;
  tasteNotes: TasteNotes;
  revisit: RamenLogRevisitLabel;
  scores: RamenLogScores | null;
  likes: number;
  commentCount: number;
}

export interface RamenLogComment {
  id: number;
  author: RamenLogAuthor;
  content: string;
  createdAt: string;
}

export type RamenLogDetail = RamenLog & {
  /** 댓글 미리보기(등록순). 나머지는 앱에서 본다 */
  comments: RamenLogComment[];
};

export interface RamenLogPage {
  items: RamenLog[];
  nextCursor: string | null;
  hasNext: boolean;
}

/** 최근 라멘로그가 남은 가게(홈 "최근 기록된 라멘집") */
export interface RecentRamenLogShop {
  id: number;
  name: string;
  location?: string;
  imageUrl: string | null;
  lastVisitedAt: string;
}

/**
 * 앱에서 가입한 회원 ID는 이 번호부터 시작한다(서버 V45 마이그레이션, 2026-10-31 운영 변경).
 * 이보다 작은 ID의 앱 회원은 웹 회원을 같은 ID로 복사한 사람이라 웹 프로필이 있고,
 * 이 이상은 웹(v1) 회원이 아니라 웹 프로필을 열면 "정보를 볼 수 없는 사용자"가 된다.
 * 앱 회원 프로필을 비로그인으로 읽는 v2 API가 없어 링크하지 않는다.
 */
const APP_ONLY_MEMBER_ID_START = 10_000_000;

/** 서버 커서 페이지의 최대 크기(CursorPage.MAX_SIZE) */
const MAX_PAGE_SIZE = 50;
const WITHDRAWN_AUTHOR_NAME = "탈퇴한 회원";

const TASTE_NOTE_BY_CODE = new Map<string, { key: TasteNoteKey; label: string }>(
  TASTE_NOTE_GROUPS.flatMap(({ key, code, options }) =>
    options.map((label, index) => [`${code}_${String(index + 1).padStart(2, "0")}`, { key, label }] as const),
  ),
);

const revisitLabelMap: Record<RamenLogRevisit, RamenLogRevisitLabel> = {
  OFTEN: "자주 감",
  SOMETIMES: "가끔 생각남",
  ONCE_IS_ENOUGH: "한번이면 충분",
};

/** 서버 맛 태그 코드 → 분류별 이름표. 모르는 코드는 버린다(앱과 같다) */
const toTasteNotes = (codes: string[] | null): TasteNotes => {
  const notes: TasteNotes = { broth: [], noodle: [], seasoning: [], topping: [] };
  for (const code of codes ?? []) {
    const note = TASTE_NOTE_BY_CODE.get(code);
    if (note && !notes[note.key].includes(note.label)) notes[note.key].push(note.label);
  }
  return notes;
};

const toAuthor = (author: MobileRamenLogAuthor): RamenLogAuthor => {
  const id = author.id === null ? null : Number(author.id);
  return {
    profileId: id !== null && id < APP_ONLY_MEMBER_ID_START ? id : null,
    name: author.nickname || WITHDRAWN_AUTHOR_NAME,
    imageUrl: author.avatarUrl || undefined,
  };
};

const toRamenLog = (log: MobileRamenLogSummary): RamenLog => {
  const imageUrls = log.imageUrls ?? [];
  return {
    id: Number(log.id),
    author: toAuthor(log.author),
    shop: {
      id: Number(log.shop.id),
      name: log.shop.name,
      location: [log.shop.branchName, log.shop.region].filter(Boolean).join(" · ") || undefined,
    },
    menuName: log.menuName,
    ramenType: log.ramenType,
    imageUrl: imageUrls[0] ?? null,
    imageUrls,
    date: log.visitedAt,
    note: log.note ?? "",
    tasteNotes: toTasteNotes(log.tasteNoteCodes),
    revisit: revisitLabelMap[log.revisitIntention] ?? "가끔 생각남",
    scores: log.scores,
    likes: log.likeCount,
    commentCount: log.commentCount,
  };
};

const getFeedPage = (params: RamenLogFeedParams, revalidate?: number) =>
  mobileApiClient<CursorPage<MobileRamenLogSummary>>("/ramen-logs", {
    query: {
      sort: params.sort,
      ramenType: params.ramenType,
      shopId: params.shopId,
      authorId: params.authorId,
      cursor: params.cursor,
      size: params.size,
    },
    revalidate,
  });

export interface RamenLogFeedParams {
  sort?: RamenLogSort;
  ramenType?: string;
  shopId?: number;
  /** 이 회원의 공개 기록만 */
  authorId?: number | string;
  cursor?: string | null;
  size?: number;
}

/** 공개 라멘로그 피드(앱 라운지와 같은 목록). authorId를 주면 그 회원의 공개 기록만 온다 */
export const getRamenLogs = async (params: RamenLogFeedParams = {}): Promise<RamenLogPage> => {
  const page = await getFeedPage(params);
  return {
    items: (page.items ?? []).map(toRamenLog),
    nextCursor: page.nextCursor,
    hasNext: page.hasNext,
  };
};

/** 라멘로그 상세. 댓글 미리보기가 함께 온다 */
export const getRamenLog = async (logId: number): Promise<RamenLogDetail> => {
  const log = await mobileApiClient<MobileRamenLogDetail>(`/ramen-logs/${encodeURIComponent(logId)}`);
  return {
    ...toRamenLog(log),
    comments: (log.commentsPreview ?? []).map((comment) => ({
      id: Number(comment.id),
      author: toAuthor(comment.author),
      content: comment.content,
      createdAt: comment.createdAt,
    })),
  };
};

/** 최근 공개 라멘로그에 나온 가게를 최신순으로 limit곳 */
export const getRecentRamenLogShops = async (
  limit = 4,
  options: { revalidate?: number } = {},
): Promise<RecentRamenLogShop[]> => {
  const page = await getFeedPage({ sort: "LATEST", size: MAX_PAGE_SIZE }, options.revalidate);
  const shops = new Map<number, RecentRamenLogShop>();
  for (const log of (page.items ?? []).map(toRamenLog)) {
    if (shops.size >= limit) break;
    if (shops.has(log.shop.id)) continue;
    shops.set(log.shop.id, {
      id: log.shop.id,
      name: log.shop.name,
      location: log.shop.location,
      imageUrl: log.imageUrl,
      lastVisitedAt: log.date,
    });
  }
  return [...shops.values()];
};
