// Shop Types
export interface Menu {
  name: string;
  votes: number;
}

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  is_signature: boolean;
  image_url: string;
}

export interface EventMenu {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  badge_text: string;
}

export interface UserPhoto {
  id: number;
  user: string;
  imageUrl: string;
  menuName: string;
  date: string;
  comment: string;
}

export interface BusinessHours {
  closed_days: string;
  open_time: string;
  close_time: string;
  break_start: string | null;
  break_end: string | null;
  parking_info: string;
}

export interface ShopStats {
  visit_count: number;
  bookmark_count: number;
}

export interface Shop {
  id: number;
  name: string;
  location: string;
  type: string;
  editorRating: number;
  userRating: number;
  description: string;
  imageUrl: string;
  menus: Menu[];
  menu_list: MenuItem[];
  event_menus?: EventMenu[];
  userPhotos: UserPhoto[];
  business_hours: BusinessHours;
  stats: ShopStats;
  instagram_url: string;
  catchTableUrl: string;
}

// User Types
export interface UserProfile {
  user_id: number;
  nickname: string;
  profile_image_url: string;
  stats: {
    visited_restaurant_count: number;
    total_photo_count: number;
    total_bookmark_count: number;
  };
}

export interface UserPhotoData {
  photo_id: number;
  image_url: string;
  restaurant_id: number;
  restaurant_name: string;
  menu_name: string;
  comment: string;
  uploaded_at: string;
}

export interface UserVisit {
  restaurant_id: number;
  restaurant_name: string;
  restaurant_image_url: string;
  address_simple: string;
  visit_count_for_user: number;
  last_visited_at: string;
}

export interface UserBookmark {
  restaurant_id: number;
  restaurant_name: string;
  restaurant_image_url: string;
  address_simple: string;
  bookmarked_at: string;
}

export interface UserPost {
  post_id: number;
  category: string;
  categoryName: string;
  title: string;
  date: string;
  likes: number;
  comments: number;
  shopName: string | null;
}

export interface UserComment {
  comment_id: number;
  content: string;
  post_id: number;
  postTitle: string;
  date: string;
  likes: number;
}
