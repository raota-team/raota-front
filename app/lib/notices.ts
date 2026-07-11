export type NoticeSection = {
  heading?: string;
  paragraphs?: string[];
  items?: string[];
};

export type Notice = {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  category: "서비스" | "운영" | "업데이트";
  pinned?: boolean;
  sections: NoticeSection[];
};

export const notices: Notice[] = [
  {
    slug: "welcome-to-raota",
    title: "라오타 서비스 이용 안내",
    summary: "라멘에 진심인 사람들이 더 편하게 기록하고 발견할 수 있도록 라오타의 주요 기능을 안내합니다.",
    publishedAt: "2026-07-11",
    category: "서비스",
    pinned: true,
    sections: [
      {
        paragraphs: [
          "라오타를 이용해 주셔서 감사합니다. 라오타는 가고 싶은 라멘집과 다녀온 한 그릇을 모아두고, 나만의 라멘 취향을 기록하는 서비스입니다.",
          "가게 정보와 이용자 기록은 더 좋은 라멘 선택을 돕기 위한 참고 자료로 제공됩니다. 방문 전에는 가게의 공식 채널을 통해 영업시간과 메뉴를 한 번 더 확인해 주세요.",
        ],
      },
      {
        heading: "주요 기능",
        items: [
          "지역, 메뉴, 취향 조건으로 라멘집 탐색",
          "방문한 가게와 한 그릇을 라멘로그로 기록",
          "다른 이용자의 방문 기록과 사진 확인",
          "커뮤니티에서 라멘 후기와 정보 공유",
        ],
      },
      {
        heading: "이용 중 도움이 필요하신가요?",
        paragraphs: ["서비스 이용 중 불편한 점이나 제안이 있다면 contact@raota.net으로 알려주세요. 확인 후 순차적으로 답변드리겠습니다."],
      },
    ],
  },
  {
    slug: "shop-information-report-guide",
    title: "라멘집 정보 수정 및 제보 안내",
    summary: "가게명, 위치, 메뉴 등 실제 정보와 다른 내용을 발견했을 때 제보하는 방법을 안내합니다.",
    publishedAt: "2026-07-08",
    category: "운영",
    sections: [
      {
        paragraphs: [
          "라오타의 가게 정보는 공개 자료와 이용자 제보를 바탕으로 정리됩니다. 정보가 실제와 다르거나 새로 문을 연 라멘집을 발견했다면 운영팀에 알려주세요.",
        ],
      },
      {
        heading: "제보할 수 있는 내용",
        items: [
          "신규 오픈 또는 폐점한 라멘집",
          "가게명, 주소, 위치 정보 변경",
          "대표 메뉴와 라멘 종류 변경",
          "잘못 등록된 사진이나 중복 가게",
        ],
      },
      {
        heading: "접수 방법",
        paragraphs: [
          "해당 가게의 상세 페이지에 있는 제보 메뉴를 이용해 수정이 필요한 내용을 보내주세요. 확인 가능한 공식 채널이나 사진을 함께 전달하면 더 빠르게 반영할 수 있습니다.",
          "가게 상세 페이지를 찾기 어렵거나 별도 문의가 필요한 경우에는 가게명과 수정 내용을 contact@raota.net으로 보내주세요.",
        ],
      },
    ],
  },
  {
    slug: "community-operation-policy",
    title: "커뮤니티 운영 원칙 안내",
    summary: "모두가 편안하게 라멘 이야기를 나눌 수 있도록 게시글과 댓글 운영 기준을 안내합니다.",
    publishedAt: "2026-07-03",
    category: "운영",
    sections: [
      {
        paragraphs: [
          "라오타 커뮤니티는 라멘 경험과 정보를 자유롭게 나누는 공간입니다. 서로 다른 취향과 경험을 존중하며 실제 방문에 도움이 되는 이야기를 나눠주세요.",
        ],
      },
      {
        heading: "다음 콘텐츠는 제한될 수 있습니다",
        items: [
          "타인을 비방하거나 차별·혐오를 조장하는 내용",
          "동일한 내용을 반복해서 게시하는 광고와 홍보",
          "개인정보 또는 타인의 권리를 침해하는 내용",
          "확인되지 않은 사실을 단정적으로 전달하는 내용",
        ],
      },
      {
        heading: "신고와 조치",
        paragraphs: [
          "운영 원칙을 위반한 콘텐츠는 신고 또는 운영진 확인을 통해 숨김이나 삭제 처리될 수 있습니다. 반복적인 위반이 확인되면 서비스 이용이 제한될 수 있습니다.",
        ],
      },
    ],
  },
  {
    slug: "service-maintenance-guide",
    title: "서비스 점검 및 장애 안내 기준",
    summary: "안정적인 서비스 운영을 위한 정기 점검과 장애 발생 시 안내 기준을 알려드립니다.",
    publishedAt: "2026-06-27",
    category: "업데이트",
    sections: [
      {
        paragraphs: [
          "안정적인 서비스 제공을 위해 필요한 경우 서버와 기능 점검을 진행할 수 있습니다. 예정된 점검은 가능한 범위에서 시작 전에 공지사항으로 안내합니다.",
          "예상하지 못한 장애가 발생한 경우 원인과 영향을 확인한 뒤 복구 상황을 순차적으로 안내하겠습니다.",
        ],
      },
      {
        heading: "점검 중 제한될 수 있는 기능",
        items: ["로그인과 회원 정보 변경", "라멘로그와 커뮤니티 콘텐츠 작성", "사진 업로드", "가게 검색과 추천 결과 갱신"],
      },
    ],
  },
];

export const getNotice = (slug: string) => notices.find((notice) => notice.slug === slug);

export const formatNoticeDate = (date: string) =>
  new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric" }).format(new Date(`${date}T00:00:00+09:00`));
