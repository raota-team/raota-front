/**
 * 웹에서 예고하는 앱 기능(출시 팝업의 "곧 나와요"와 홈 "곧 나와요" 섹션이 같이 쓴다).
 * 앱 안과 App Store 설명에는 예고하지 않는다(준비 중 기능 안내는 심사 거절 사유가 될 수 있다).
 * 기능을 켜는 날 여기서 빼고 팝업 AVAILABLE_FEATURES로 옮긴다. 날짜를 못 지킬 것 같으면 when을 바꾼다.
 */
export type UpcomingFeature = {
  id: 'android' | 'taste-report' | 'personal-ai';
  title: string;
  /** 상태 칩. 정해진 월만 적는다("11월 출시", "12월 중") */
  when: string;
  description: string;
  /** 버튼이 없는 카드 아래 조용한 한 줄 */
  note?: string;
};

export const UPCOMING_FEATURES: UpcomingFeature[] = [
  {
    id: 'android',
    title: 'Android 앱',
    when: '11월 출시',
    description: 'iPhone에서 먼저 나온 라오타를 Android에서도 써요. 기록은 계정에 그대로 이어져요.',
  },
  {
    id: 'taste-report',
    title: '나만의 취향 리포트',
    when: '12월 중',
    description: '기록한 그릇이 쌓이면 국물·면·토핑 취향을 한 장으로 정리해요. 매달 1일엔 지난달 리포트가 와요.',
    note: '기록을 남겨 두면 나오는 날 바로 볼 수 있어요',
  },
  {
    id: 'personal-ai',
    title: '내 입맛을 아는 AI 추천',
    when: '12월 중',
    description: '지금은 오늘 고른 국물과 상황으로 추천해요. 앞으로는 내가 남긴 라멘로그까지 보고 골라요.',
    note: '지금 추천도 앱에서 바로 써 볼 수 있어요',
  },
];
