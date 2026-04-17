{/* 기존 내용은 유지하고 mockComments만 추가 */}
export interface CommunityCategory {
  id: string;
  name: string;
  icon: string;
}

export interface CommunityPost {
  id: number;
  category: string;
  categoryName: string;
  title: string;
  content?: string;
  authorId: number;
  author: string;
  authorAvatar?: string;
  date: string;
  shopId?: number | null;
  shopName?: string | null;
  likes: number;
  comments: number;
  imageUrl?: string | null;
}

export interface Comment {
  id: number;
  authorId: number;
  author: string;
  avatar: string;
  content: string;
  date: string;
  likes: number;
}

export const communityCategories: CommunityCategory[] = [
  { id: 'all', name: '전체', icon: '📋' },
  { id: 'review', name: '맛집후기', icon: '🍜' },
  { id: 'tip', name: '꿀팁', icon: '💡' },
  { id: 'question', name: '질문', icon: '❓' },
];

export const mockCommunityPosts: CommunityPost[] = [
  {
    id: 1,
    category: 'review',
    categoryName: '맛집후기',
    title: '멘야 무사시 진한 츠케멘 후기입니다!',
    content: '<p>오늘 드디어 멘야 무사시를 다녀왔어요! 웨이팅 30분 정도 하고 들어갔는데 정말 기다린 보람이 있었습니다.</p><p>진한 츠케멘을 시켰는데 면발이 정말 쫄깃쫄깃하고, 국물도 진하면서도 느끼하지 않아서 끝까지 맛있게 먹었어요. 차슈는 부드럽고 녹듯이 풀어지더라구요.</p><p>다음에는 매운 츠케멘도 도전해보고 싶네요. 마포 쪽 라멘집 찾으시는 분들께 강추합니다!</p>',
    authorId: 101,
    author: 'NoodleKing',
    authorAvatar: '🍜',
    date: '2024.03.18',
    shopId: 1,
    shopName: '멘야 무사시 (Menya Musashi)',
    likes: 24,
    comments: 8,
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    category: 'tip',
    categoryName: '꿀팁',
    title: '라멘 맛있게 먹는 꿀팁 공유해요',
    content: '<p>제가 라멘집 50군데 넘게 다니면서 터득한 꿀팁들을 공유할게요!</p><p>1. 면 익힘 정도: 처음 가는 집이라면 보통(후츠우)으로 시작하세요. 가게마다 기준이 다르거든요.</p><p>2. 토핑 추가: 반숙란(아지타마)는 무조건 추가하세요. 국물에 노른자 풀어먹으면 진짜 맛있어요.</p><p>3. 마지막엔 밥: 남은 국물에 밥 말아먹으면 라멘 한 그릇이 두 배로 즐거워집니다.</p><p>4. 웨이팅 팁: 오픈 시간 10분 전에 가면 첫 타임에 들어갈 수 있어요!</p>',
    authorId: 102,
    author: 'RamenPro',
    authorAvatar: '🎓',
    date: '2024.03.17',
    shopId: null,
    shopName: null,
    likes: 156,
    comments: 32,
    imageUrl: null,
  },
  {
    id: 3,
    category: 'question',
    categoryName: '질문',
    title: '강남 근처 토리 파이탄 추천해주세요!',
    content: '<p>요즘 닭 육수 라멘에 빠졌는데요, 강남 근처에서 토리 파이탄 맛집 추천해주세요!</p><p>크리미한 스타일을 좋아하고, 가능하면 점심시간에 웨이팅 많이 안 하는 곳이면 좋겠어요.</p><p>미리 감사드립니다 🙏</p>',
    authorId: 103,
    author: 'ChickenLover',
    authorAvatar: '🐔',
    date: '2024.03.16',
    shopId: null,
    shopName: null,
    likes: 5,
    comments: 12,
    imageUrl: null,
  },
  {
    id: 4,
    category: 'review',
    categoryName: '맛집후기',
    title: '토리 파이탄 오레노 방문 후기 (강추!)',
    content: '<p>위에서 강남 토리 파이탄 추천글 보고 오레노 다녀왔습니다!</p><p>정말 크리미하고 부드러운 닭 육수가 일품이에요. 거품이 카푸치노처럼 올라와있는데 이게 진짜 고소하더라구요.</p><p>카라 파이탄(매운맛)도 시켜봤는데, 매운맛과 크리미함의 조화가 기가 막힙니다. 다음에는 친구들 데리고 또 갈 예정이에요!</p>',
    authorId: 104,
    author: 'SeoulFoodie',
    authorAvatar: '😋',
    date: '2024.03.15',
    shopId: 2,
    shopName: '토리 파이탄 오레노 (Oreno)',
    likes: 47,
    comments: 15,
    imageUrl: 'https://images.unsplash.com/photo-1618841557871-b4664fbf0cb3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 5,
    category: 'tip',
    categoryName: '꿀팁',
    title: '부산 쇼유 대장 첫 방문 전 알아두면 좋은 것들',
    content: '<p>부산 여행 가시는 분들을 위한 쇼유 대장 팁입니다!</p><p>📍 위치: 부산진구에 있어요. 서면역에서 걸어서 10분 정도</p><p>⏰ 영업시간: 화요일 휴무! 꼭 확인하고 가세요.</p><p>🍜 추천 메뉴: 특제 쇼유 라멘이 시그니처예요. 시오 라멘도 괜찮은데 역시 쇼유가 더 맛있어요.</p><p>💡 꿀팁: 브레이크 타임 없이 쭉 영업하니까 3시쯤 가면 웨이팅 없어요!</p>',
    authorId: 105,
    author: 'BusanTripper',
    authorAvatar: '🚂',
    date: '2024.03.14',
    shopId: 3,
    shopName: '쇼유 대장 (Shoyu Boss)',
    likes: 31,
    comments: 7,
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 6,
    category: 'question',
    categoryName: '질문',
    title: '지로계 라멘 입문하려는데 조언 부탁드려요',
    content: '<p>라멘 초보인데 지로계 라멘이 맛있다고 해서 도전해보려고 합니다.</p><p>근데 양이 엄청 많고 자극적이라고 들었는데... 처음 먹을 때 주의할 점이 있을까요?</p><p>콜 방법이라던지, 양 조절하는 법 같은거 알려주시면 감사하겠습니다!</p>',
    authorId: 106,
    author: 'RamenNewbie',
    authorAvatar: '🌱',
    date: '2024.03.13',
    shopId: null,
    shopName: null,
    likes: 12,
    comments: 28,
    imageUrl: null,
  },
  {
    id: 7,
    category: 'review',
    categoryName: '맛집후기',
    title: '홍대 마시타야 방문했습니다 (블랙라멘)',
    content: '<p>블랙라멘이 유명하다고 해서 가봤는데 정말 국물이 진국이네요. 차슈도 두툼하고 맛있었습니다.</p>',
    authorId: 107,
    author: 'HongdaeLover',
    authorAvatar: '🕶️',
    date: '2024.03.12',
    shopId: null,
    shopName: '마시타야',
    likes: 45,
    comments: 5,
    imageUrl: 'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 8,
    category: 'tip',
    categoryName: '꿀팁',
    title: '라멘 먹을 때 머리끈 필수!',
    content: '<p>긴 머리 분들은 머리끈 꼭 챙기세요. 국물 튀면 곤란하잖아요. 가게에 달라고 하면 주는 곳도 많아요.</p>',
    authorId: 108,
    author: 'LongHairLife',
    authorAvatar: '🎀',
    date: '2024.03.11',
    shopId: null,
    shopName: null,
    likes: 88,
    comments: 14,
    imageUrl: null,
  },
];

export const mockComments: Record<number, Comment[]> = {
  1: [
    { id: 1, authorId: 201, author: 'RamenFan', avatar: '🍥', content: '저도 거기 자주 가요! 진한 츠케멘 최고죠', date: '2024.03.18', likes: 3 },
    { id: 2, authorId: 202, author: 'FoodieKim', avatar: '👨‍🍳', content: '매운 츠케멘도 진짜 맛있어요. 도전해보세요!', date: '2024.03.18', likes: 5 },
  ],
  2: [
    { id: 1, authorId: 203, author: 'NoodleLover', avatar: '🍜', content: '아지타마 꿀팁 감사해요! 다음에 꼭 추가해봐야겠어요', date: '2024.03.17', likes: 8 },
    { id: 2, authorId: 204, author: 'SeoulEats', avatar: '🥢', content: '밥 말아먹는건 진리죠 ㅎㅎ', date: '2024.03.17', likes: 12 },
  ],
  3: [
    { id: 1, authorId: 205, author: 'LocalGuide', avatar: '🗺️', content: '오레노 추천드려요! 강남역 근처인데 크리미해요', date: '2024.03.16', likes: 6 },
    { id: 2, authorId: 206, author: 'ChickenGod', avatar: '🐓', content: '저도 오레노 좋아해요. 카라 파이탄도 맛있어요!', date: '2024.03.16', likes: 4 },
  ],
  4: [
    { id: 1, authorId: 103, author: 'ChickenLover', avatar: '🐔', content: '제 질문글 보고 가셨군요! 저도 가봐야겠어요', date: '2024.03.15', likes: 2 },
  ],
  5: [
    { id: 1, authorId: 207, author: 'TravelKorea', avatar: '✈️', content: '부산 가면 꼭 들러볼게요!', date: '2024.03.14', likes: 1 },
  ],
  6: [
    { id: 1, authorId: 208, author: 'JiroMaster', avatar: '💪', content: '처음엔 면 반(쇼메), 야채 보통(후츠우)으로 콜하세요!', date: '2024.03.13', likes: 15 },
    { id: 2, authorId: 209, author: 'RamenVet', avatar: '🎖️', content: '꼭 빈 속에 가지 마시고, 배고플 때 가세요 ㅎㅎ', date: '2024.03.13', likes: 9 },
  ],
};
