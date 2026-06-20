import { Shop, UserProfile, UserPhotoData, UserVisit, UserBookmark, UserPost, UserComment } from '@/app/types';

// --- Mock Data: Shops ---
export const initialShops: Shop[] = [
  {
    id: 1,
    name: "멘야 무사시 (Menya Musashi)",
    location: "서울 마포구",
    type: "츠케멘",
    editorRating: 4.5,
    userRating: 4.2,
    description: "더블 수프의 원조격인 곳. 묵직한 동물계 육수와 향긋한 어패류 육수의 조화가 일품이다. 면발의 탄력은 마치 비트감이 살아있는 베이스 기타 연주를 듣는 듯하다.",
    imageUrl: "https://images.unsplash.com/photo-1552611052-33e04de081de?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    menus: [
      { name: "진한 츠케멘", votes: 124 },
      { name: "라멘", votes: 45 },
      { name: "매운 츠케멘", votes: 32 }
    ],
    menu_list: [
      { id: 1, name: "진한 츠케멘", price: 10000, is_signature: true, image_url: "https://images.unsplash.com/photo-1552611052-33e04de081de?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80" },
      { id: 2, name: "라멘", price: 9000, is_signature: false, image_url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80" },
      { id: 3, name: "매운 츠케멘", price: 10500, is_signature: false, image_url: "https://images.unsplash.com/photo-1591814468924-caf88d1232e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80" },
      { id: 4, name: "차슈동", price: 4000, is_signature: false, image_url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80" }
    ],
    event_menus: [
      {
        id: 501,
        name: "핑크 초코 라멘",
        description: "달콤한 화이트 초콜릿과 돈코츠 육수의 의외의 조합! 핑크빛 면이 사랑스러운 한정판 라멘.",
        price: 12000,
        image_url: "https://images.unsplash.com/photo-1626804475297-411dbe631260?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        badge_text: "발렌타인 한정"
      }
    ],
    userPhotos: [
      { id: 101, user: "NoodleKing", imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80", menuName: "진한 츠케멘", date: "24.03.10", comment: "진짜 인생 츠케멘입니다. 면발이 끝내줘요!" },
      { id: 102, user: "RamenLover", imageUrl: "https://images.unsplash.com/photo-1591814468924-caf88d1232e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80", menuName: "라멘", date: "24.03.09", comment: "국물이 깊고 진해서 밥 말아먹고 싶었어요." },
      { id: 103, user: "SeoulEats", imageUrl: "https://images.unsplash.com/photo-1552611052-81315579d479?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80", menuName: "진한 츠케멘", date: "24.03.05", comment: "웨이팅이 좀 길었지만 기다린 보람이 있네요." },
      { id: 104, user: "FoodieJ", imageUrl: "https://images.unsplash.com/photo-1617380903332-9cb98f6d538e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80", menuName: "차슈동", date: "24.02.28", comment: "차슈가 입에서 살살 녹습니다. 사이드로 강추!" },
    ],
    business_hours: { closed_days: "연중무휴", open_time: "11:30", close_time: "21:30", break_start: "15:30", break_end: "17:00", parking_info: "불가" },
    stats: { visit_count: 100, view_count: 240, bookmark_count: 50 },
    ramenLogCount: 0,
    ramenLogPreviewImageUrls: [],
    instagram_url: "https://instagram.com/menyamusashi",
    catchTableUrl: "https://catchtable.co.kr/menyamusashi",
    isBookmarked: false
  },
  {
    id: 2,
    name: "토리 파이탄 오레노 (Oreno)",
    location: "서울 강남구",
    type: "토리 파이탄",
    editorRating: 4.8,
    userRating: 4.9,
    description: "닭 육수의 크리미함을 극한으로 끌어올렸다. 카푸치노처럼 부드러운 거품 아래 숨겨진 감칠맛은 세련된 R&B 보컬의 가성처럼 매끄럽게 넘어간다.",
    imageUrl: "https://images.unsplash.com/photo-1618841557871-b4664fbf0cb3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    menus: [{ name: "토리 파이탄", votes: 210 }, { name: "카라 파이탄", votes: 89 }, { name: "차슈 덮밥", votes: 15 }],
    menu_list: [
      { id: 1, name: "토리 파이탄", price: 11000, is_signature: true, image_url: "https://images.unsplash.com/photo-1618841557871-b4664fbf0cb3?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80" },
      { id: 2, name: "카라 파이탄", price: 11500, is_signature: false, image_url: "https://images.unsplash.com/photo-1623341214823-6902521c726c?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80" }
    ],
    userPhotos: [
      { id: 201, user: "ChickenGod", imageUrl: "https://images.unsplash.com/photo-1618841557871-b4664fbf0cb3?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80", menuName: "토리 파이탄", date: "24.03.12", comment: "닭 육수가 이렇게 진할 수 있다니 놀랍습니다." },
    ],
    business_hours: { closed_days: "매주 월요일", open_time: "11:30", close_time: "21:00", break_start: "15:00", break_end: "17:00", parking_info: "주차 지원" },
    stats: { visit_count: 80, view_count: 190, bookmark_count: 40 },
    ramenLogCount: 0,
    ramenLogPreviewImageUrls: [],
    instagram_url: "https://instagram.com/oreno",
    catchTableUrl: "https://catchtable.co.kr/oreno",
    isBookmarked: false
  },
  {
    id: 3,
    name: "쇼유 대장 (Shoyu Boss)",
    location: "부산 부산진구",
    type: "쇼유 라멘",
    editorRating: 4.0,
    userRating: 3.8,
    description: "클래식한 쇼유 라멘의 정석. 맑은 청탕 육수에서 느껴지는 깊은 간장의 풍미는 오래된 명반처럼 질리지 않는 매력을 선사한다.",
    imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    menus: [{ name: "특제 쇼유 라멘", votes: 56 }, { name: "시오 라멘", votes: 60 }, { name: "교자", votes: 22 }],
    menu_list: [
      { id: 1, name: "쇼유 라멘", price: 9000, is_signature: true, image_url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80" }
    ],
    userPhotos: [{ id: 301, user: "BusanMan", imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80", menuName: "특제 쇼유 라멘", date: "24.03.01", comment: "깔끔한 국물 맛이 일품입니다. 부산 오면 꼭 들러야 할 곳!" }],
    business_hours: { closed_days: "매주 화요일", open_time: "11:00", close_time: "20:00", break_start: null, break_end: null, parking_info: "공영 주차장" },
    stats: { visit_count: 60, view_count: 150, bookmark_count: 30 },
    ramenLogCount: 0,
    ramenLogPreviewImageUrls: [],
    instagram_url: "https://instagram.com/shoyuboss",
    catchTableUrl: "https://catchtable.co.kr/shoyuboss",
    isBookmarked: false
  }
];

// --- Mock Data: User Profile ---
export const mockUserProfile = {
  data: {
    user_id: 1,
    nickname: "이스프린",
    profile_image_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
    stats: { visited_restaurant_count: 12, total_photo_count: 4, total_bookmark_count: 2 }
  } as UserProfile
};

export const mockUserPhotos = {
  status: "SUCCESS",
  data: {
    content: [
      { photo_id: 801, image_url: "https://images.unsplash.com/photo-1552611052-33e04de081de?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80", restaurant_id: 1, restaurant_name: "멘야 무사시", menu_name: "진한 츠케멘", comment: "진짜 인생 츠케멘입니다. 면발이 끝내줘요!", uploaded_at: "2025-10-28T14:30:00" },
      { photo_id: 802, image_url: "https://images.unsplash.com/photo-1618841557871-b4664fbf0cb3?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80", restaurant_id: 2, restaurant_name: "토리 파이탄 오레노", menu_name: "토리 파이탄", comment: "국물이 정말 진하고 고소해요.", uploaded_at: "2025-10-27T19:15:12" },
      { photo_id: 803, image_url: "https://images.unsplash.com/photo-1618841557871-b4664fbf0cb3?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80", restaurant_id: 2, restaurant_name: "토리 파이탄 오레노", menu_name: "카라 파이탄", comment: "매콤한 맛이 느끼함을 잡아줘서 좋습니다.", uploaded_at: "2025-10-26T12:00:00" },
      { photo_id: 804, image_url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80", restaurant_id: 3, restaurant_name: "쇼유 대장", menu_name: "쇼유 라멘", comment: "깔끔한 국물이 일품이네요.", uploaded_at: "2025-10-20T18:00:00" }
    ] as UserPhotoData[]
  }
};

export const mockUserVisits = {
  data: {
    visits: [
      { restaurant_id: 2, restaurant_name: "토리 파이탄 오레노", restaurant_image_url: "https://images.unsplash.com/photo-1618841557871-b4664fbf0cb3?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80", address_simple: "서울 강남구", visit_count_for_user: 3, last_visited_at: "2025-11-05T13:00:00" },
      { restaurant_id: 1, restaurant_name: "멘야 무사시", restaurant_image_url: "https://images.unsplash.com/photo-1552611052-33e04de081de?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80", address_simple: "서울 마포구", visit_count_for_user: 1, last_visited_at: "2025-10-28T14:30:00" }
    ] as UserVisit[]
  }
};

export const mockUserBookmarks = {
  data: {
    bookmarks: [
      { restaurant_id: 2, restaurant_name: "토리 파이탄 오레노", restaurant_image_url: "https://images.unsplash.com/photo-1618841557871-b4664fbf0cb3?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80", address_simple: "서울 강남구", bookmarked_at: "2025-11-01T10:00:00" },
      { restaurant_id: 3, restaurant_name: "쇼유 대장", restaurant_image_url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80", address_simple: "부산 부산진구", bookmarked_at: "2025-10-20T18:00:00" }
    ] as UserBookmark[]
  }
};

// --- Mock Data: User Community Activity ---
export const mockUserPosts = {
  data: {
    posts: [
      { post_id: 1, category: 'review', categoryName: '맛집후기', title: '멘야 무사시 진한 츠케멘 후기입니다!', date: '2024.03.18', likes: 24, comments: 8, shopName: '멘야 무사시' },
      { post_id: 2, category: 'tip', categoryName: '꿀팁', title: '라멘 맛있게 먹는 꿀팁 공유해요', date: '2024.03.17', likes: 156, comments: 32, shopName: null }
    ] as UserPost[]
  }
};

export const mockUserComments = {
  data: {
    comments: [
      { comment_id: 1, content: '저도 거기 자주 가요! 진한 츠케멘 최고죠', post_id: 1, postTitle: '멘야 무사시 진한 츠케멘 후기입니다!', date: '2024.03.18', likes: 3 },
      { comment_id: 2, content: '아지타마 꿀팁 감사해요! 다음에 꼭 추가해봐야겠어요', post_id: 2, postTitle: '라멘 맛있게 먹는 꿀팁 공유해요', date: '2024.03.17', likes: 8 },
      { comment_id: 3, content: '오레노 추천드려요! 강남역 근처인데 크리미해요', post_id: 3, postTitle: '강남 근처 토리 파이탄 추천해주세요!', date: '2024.03.16', likes: 6 }
    ] as UserComment[]
  }
};
