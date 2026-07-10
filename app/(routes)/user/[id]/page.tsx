'use client';

import { useState, useEffect, useRef, useCallback, use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Camera, MapPin, Heart, Award, FileText, MessageSquare, X, Loader2, ArrowRight, Edit3, AlertCircle, Trash2, ChevronDown, ChevronUp, Eye, EyeOff, Shield, Mail } from 'lucide-react';
import PhotoModal from '../../../components/PhotoModal';
import RamenLogModal, { type RamenLogFormData } from '../../../components/RamenLogModal';
import RamenLogCard, {
  emptyTasteNotes,
  formatRamenLogDate,
  tasteNoteLabels,
  tasteNoteOrder,
  type RamenLogItem,
} from '../../../components/RamenLogCard';
import { useApp } from '../../../context/AppContext';
import {
  getMyProfile,
  getUserProfile,
  getMyVisits,
  getUserVisits,
  getMyBookmarks,
  getMyPosts,
  getUserPosts,
  getMyComments,
  getUserComments,
  updateMyPrivacySettings,
  updateMyEmail,
  updateUserProfile,
  ActivityVisibility,
  MyProfileData,
  PageMeta
} from '@/lib/api/user';
import {
  deleteRamenLog,
  getMyRamenLogs,
  getMyRamenLogShops,
  getUserRamenLogs,
  getUserRamenLogShops,
  toggleRamenLogLike,
  toRevisitValue,
  updateRamenLog,
  type RamenLog,
} from '@/lib/api/ramen-logs';
import { getUploadTicket, uploadFileToStorage } from '@/lib/api/files';
import { compressImage } from '@/lib/utils/image-optimization';
import Loading from '@/app/loading';

// HTML 태그 제거 유틸리티
const stripHtml = (html: string) => {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ');
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'REVIEW': return '맛집후기';
    case 'TIP': return '라멘꿀팁';
    case 'QUESTION': return 'Q&A';
    case 'FREE': return '자유게시판';
    default: return category;
  }
};

const getEditableBio = (profile: MyProfileData) => {
  return profile.userDescription && profile.userDescription !== profile.nickname
    ? profile.userDescription
    : '';
};

const getProfileEmail = (profile: MyProfileData) =>
  profile.email || profile.memberEmail || profile.member_email || '';

const getShopId = (item: any) =>
  item.restaurant_id || item.shopId || item.shop_id || item.ramenShopId || item.ramen_shop_id || item.id;

const getShopName = (item: any) =>
  item.restaurant_name || item.restaurantName || item.shopName || item.shop_name || item.name || '이름 미정';

const getShopImageUrl = (item: any) =>
  item.restaurant_image_url || item.shopImageUrl || item.shop_image_url || item.thumbnailUrl || item.thumbnail_url || item.imageUrl || item.image_url || '/hero-home.jpg';

const getShopAddress = (item: any) =>
  item.simple_address || item.address_simple || item.region || item.address || item.location || '주소 정보 없음';

const getLogShopId = (item: any) =>
  Number(item.shop?.id || item.restaurant_id || item.shopId || item.shop_id || item.ramenShopId || item.ramen_shop_id) || null;

type LogShopFilter = {
  id: number;
  name: string;
};

const allPublicVisibility: ActivityVisibility = {
  logs: true,
  visits: true,
  posts: true,
  comments: true,
};

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const userIdFromPath = resolvedParams.id;
  const { isLoggedIn, showConfirm, showToast, currentUser, setCurrentUser } = useApp();

  const [activeTab, setActiveTab] = useState('logs');
  const [profile, setProfile] = useState<MyProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [editForm, setEditForm] = useState({
    nickname: '',
    bio: '',
    profileImage: '',
    backgroundImage: ''
  });

  const [selectedFiles, setSelectedFiles] = useState<{
    profile: File | null;
    background: File | null;
  }>({ profile: null, background: null });

  const [markedForDelete, setMarkedForDelete] = useState<{
    profile: boolean;
    background: boolean;
  }>({ profile: false, background: false });

  const [items, setItems] = useState<any[]>([]);
  const [pageMeta, setPageMeta] = useState<PageMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [logShopFilters, setLogShopFilters] = useState<LogShopFilter[]>([]);
  const [selectedLogShopId, setSelectedLogShopId] = useState<number | null>(null);
  const [isLogShopDropdownOpen, setIsLogShopDropdownOpen] = useState(false);
  const [logShopSearchQuery, setLogShopSearchQuery] = useState('');
  const logShopDropdownRef = useRef<HTMLDivElement>(null);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useCallback((node: HTMLElement | null) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && pageMeta?.hasNext) {
        loadMore();
      }
    });

    if (node) observer.current.observe(node);
  }, [isLoading, pageMeta]);

  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [editingLog, setEditingLog] = useState<RamenLogItem | null>(null);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isPrivacySaving, setIsPrivacySaving] = useState(false);
  const [privacySettings, setPrivacySettings] = useState<ActivityVisibility>(allPublicVisibility);
  const [savedPrivacySettings, setSavedPrivacySettings] = useState<ActivityVisibility>(allPublicVisibility);
  const [isEmailEditing, setIsEmailEditing] = useState(false);
  const [emailForm, setEmailForm] = useState('');
  const [isEmailSaving, setIsEmailSaving] = useState(false);

  const isOwnProfile = useMemo(() => {
    if (!currentUser) return false;
    const myId = String(currentUser.user_id || currentUser.id);
    return myId === String(userIdFromPath);
  }, [currentUser, userIdFromPath]);

  useEffect(() => {
    if (isOwnProfile || !profile) return;
    const visibility = profile.activity_visibility || allPublicVisibility;
    const visibleTabs = (['logs', 'visits', 'posts', 'comments'] as const)
      .filter((tab) => visibility[tab]);
    if (!visibleTabs.includes(activeTab as typeof visibleTabs[number])) {
      setActiveTab(visibleTabs[0] || 'none');
    }
  }, [activeTab, isOwnProfile, profile]);

  const fetchProfile = useCallback(async () => {
    setIsInitialLoading(true);
    setIsError(false);
    setIsBioExpanded(false);
    try {
      const res = isOwnProfile ? await getMyProfile() : await getUserProfile(userIdFromPath);
      setProfile(res.data);
      setEmailForm(getProfileEmail(res.data));
      const visibility = res.data.activity_visibility || allPublicVisibility;
      setPrivacySettings(visibility);
      setSavedPrivacySettings(visibility);
      setEditForm({
        nickname: res.data.nickname,
        bio: getEditableBio(res.data),
        profileImage: res.data.profile_image_url || '',
        backgroundImage: res.data.background_image_url || ''
      });
      if (isOwnProfile && setCurrentUser) {
        setCurrentUser(res.data);
      }
      setTimeout(() => setIsInitialLoading(false), 300);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setIsError(true);
      showToast('정보를 불러올 수 없는 사용자입니다.', 'error');
      setIsInitialLoading(false);
    }
  }, [isOwnProfile, userIdFromPath, setCurrentUser, showToast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const fetchTabData = useCallback(async (page: number) => {
    if (isError) return;
    if (!isOwnProfile && profile && activeTab !== 'bookmarks') {
      const visibility = profile.activity_visibility || allPublicVisibility;
      if (!visibility[activeTab as keyof ActivityVisibility]) {
        setItems([]);
        setPageMeta(null);
        return;
      }
    }
    setIsLoading(true);
    try {
      let res;
      if (isOwnProfile) {
        switch (activeTab) {
          case 'logs': res = { data: await getMyRamenLogs({ page, size: 8, shopId: selectedLogShopId || undefined }) }; break;
          case 'visits': res = await getMyVisits(page); break;
          case 'bookmarks': res = await getMyBookmarks(page); break;
          case 'posts': res = await getMyPosts(page); break;
          case 'comments': res = await getMyComments(page); break;
          default: return;
        }
      } else {
        switch (activeTab) {
          case 'logs': res = { data: await getUserRamenLogs(userIdFromPath, { page, size: 8, shopId: selectedLogShopId || undefined }) }; break;
          case 'posts': res = await getUserPosts(userIdFromPath, page); break;
          case 'comments': res = await getUserComments(userIdFromPath, page); break;
          case 'visits': res = await getUserVisits(userIdFromPath, page); break;
          default: return;
        }
      }

      if (res && res.data) {
        const validItems = (res.data.items || []).filter((item: any) => {
          if (activeTab === 'logs') return !!item.id;
          if (activeTab === 'visits' || activeTab === 'bookmarks') return !!getShopId(item);
          if (activeTab === 'posts') return !!(item.post_id || item.postId || item.id);
          if (activeTab === 'comments') return !!(item.commentId || item.id);
          return true;
        });
        setItems(prev => page === 0 ? validItems : [...prev, ...validItems]);
        setPageMeta(res.data.page || null);
      }
    } catch (err) {
      console.error(`Failed to fetch ${activeTab}:`, err);
      if (page === 0) setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, isOwnProfile, userIdFromPath, isError, selectedLogShopId, profile]);

  useEffect(() => {
    fetchTabData(0);
  }, [fetchTabData]);

  useEffect(() => {
    if (activeTab !== 'logs' || isError) return;

    let isCancelled = false;

    const fetchLogShopFilters = async () => {
      try {
        const shops = isOwnProfile
          ? await getMyRamenLogShops()
          : await getUserRamenLogShops(userIdFromPath);

        if (isCancelled) return;

        setLogShopFilters(shops.map((shop) => ({ id: shop.id, name: shop.name })));
      } catch (error) {
        console.error('Failed to fetch ramen log shops:', error);
        if (!isCancelled) setLogShopFilters([]);
      }
    };

    fetchLogShopFilters();

    return () => {
      isCancelled = true;
    };
  }, [activeTab, isError, isOwnProfile, userIdFromPath]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (logShopDropdownRef.current && !logShopDropdownRef.current.contains(event.target as Node)) {
        setIsLogShopDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadMore = () => {
    if (pageMeta && pageMeta.hasNext) {
      fetchTabData(pageMeta.number + 1);
    }
  };

  const handleTabChange = (tab: string) => {
    setItems([]);
    setPageMeta(null);
    setSelectedLogShopId(null);
    setIsLogShopDropdownOpen(false);
    setLogShopSearchQuery('');
    if (tab === activeTab) {
      fetchTabData(0);
      return;
    }
    setActiveTab(tab);
  };

  const handleLogLikeChange = async (logId: number) => {
    if (!isLoggedIn) {
      showConfirm('로그인이 필요한 기능입니다.\n로그인 페이지로 이동하시겠습니까?', () => {
        router.push('/login');
      });
      throw new Error('Login required');
    }

    const result = await toggleRamenLogLike(logId);
    setItems((current) =>
      current.map((item) =>
        Number(item.id) === logId
          ? { ...item, likes: result.likeCount, isLiked: result.liked }
          : item,
      ),
    );
    setSelectedPhoto((current: any) =>
      current?.id === logId
        ? { ...current, likes: result.likeCount, isLiked: result.liked }
        : current,
    );
  };

  const handleEditLog = (logId: number) => {
    const item = items.find((candidate) => Number(candidate.id) === logId);
    if (!item) return;
    setSelectedPhoto(null);
    setEditingLog(toRamenLogItem(item));
  };

  const handleUpdateLog = async (data: RamenLogFormData) => {
    if (!editingLog) return;
    if (!data.shopId) throw new Error('라멘 가게를 선택해주세요.');

    const updated = await updateRamenLog(editingLog.id, {
      shopId: data.shopId,
      menuName: data.menuName,
      ramenType: data.ramenType,
      imageUrl: data.imageUrl,
      visitedAt: data.visitedAt,
      note: data.note || undefined,
      tasteNotes: data.tasteNotes,
      revisit: toRevisitValue(data.revisit),
      public: data.isPublic,
    });
    setItems((current) => current.map((item) => item.id === updated.id ? updated : item));
    setEditingLog(null);
    showToast('라멘로그를 수정했습니다.', 'success');
  };

  const handleDeleteLog = async (logId: number) => {
    await deleteRamenLog(logId);
    setItems((current) => current.filter((item) => Number(item.id) !== logId));
    setSelectedPhoto(null);
    showToast('라멘로그를 삭제했습니다.', 'success');
  };

  const handleEditStart = () => {
    if (!profile) return;
    setEditForm({
      nickname: profile.nickname,
      bio: getEditableBio(profile),
      profileImage: profile.profile_image_url || '',
      backgroundImage: profile.background_image_url || '',
    });
    setSelectedFiles({ profile: null, background: null });
    setMarkedForDelete({ profile: false, background: false });
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    if (!profile) return;
    setEditForm({
      nickname: profile.nickname,
      bio: getEditableBio(profile),
      profileImage: profile.profile_image_url || '',
      backgroundImage: profile.background_image_url || '',
    });
    setSelectedFiles({ profile: null, background: null });
    setMarkedForDelete({ profile: false, background: false });
    setIsSubmitting(false);
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      let finalProfileUrl = profile?.profile_image_url;
      let finalBackgroundUrl = profile?.background_image_url;

      if (markedForDelete.profile) finalProfileUrl = null as any;
      if (markedForDelete.background) finalBackgroundUrl = null as any;

      if (selectedFiles.profile) {
        const compressed = await compressImage(selectedFiles.profile);
        const ticket = await getUploadTicket({ type: 'PROFILE', extension: 'webp', contentType: 'image/webp' });
        finalProfileUrl = await uploadFileToStorage(ticket, compressed);
      }

      if (selectedFiles.background) {
        const compressed = await compressImage(selectedFiles.background);
        const ticket = await getUploadTicket({ type: 'BACKGROUND', extension: 'webp', contentType: 'image/webp' });
        finalBackgroundUrl = await uploadFileToStorage(ticket, compressed);
      }

      await updateUserProfile({
        nickname: editForm.nickname,
        bio: editForm.bio,
        profile_image_url: finalProfileUrl || undefined,
        background_image_url: finalBackgroundUrl || undefined,
      } as any);

      setIsEditing(false);
      showToast('프로필이 성공적으로 저장되었습니다!', 'success');
      fetchProfile();
      setSelectedFiles({ profile: null, background: null });
      setMarkedForDelete({ profile: false, background: false });
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      showToast(err.message || '프로필 수정에 실패했습니다.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'profileImage' | 'backgroundImage') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showToast('이미지 크기는 10MB 이하여야 합니다.', 'error');
        return;
      }
      const key = type === 'profileImage' ? 'profile' : 'background';
      setSelectedFiles(prev => ({ ...prev, [key]: file }));
      setMarkedForDelete(prev => ({ ...prev, [key]: false }));
      const reader = new FileReader();
      reader.onload = (e) => setEditForm(prev => ({ ...prev, [type]: e.target?.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleImageDelete = (type: 'profile' | 'background') => {
    setMarkedForDelete(prev => ({ ...prev, [type]: true }));
    setSelectedFiles(prev => ({ ...prev, [type]: null }));
    setEditForm(prev => ({
      ...prev,
      [type === 'profile' ? 'profileImage' : 'backgroundImage']: ''
    }));
  };

  const handleZoomImage = (url: string, title: string) => {
    if (isEditing) return;
    if (!url) return;
    setSelectedPhoto({
      image_url: url,
      menuName: title,
      isUserPhoto: true,
      restaurant_name: '사용자 프로필',
      uploaded_at: '',
      description: ''
    });
  };

  const openPrivacyModal = () => {
    setPrivacySettings(savedPrivacySettings);
    setIsPrivacyModalOpen(true);
  };

  const closePrivacyModal = () => {
    setPrivacySettings(savedPrivacySettings);
    setIsPrivacyModalOpen(false);
  };

  const handlePrivacySave = async () => {
    setIsPrivacySaving(true);
    try {
      const response = await updateMyPrivacySettings(privacySettings);
      setPrivacySettings(response.data);
      setSavedPrivacySettings(response.data);
      setProfile((current) => current ? { ...current, activity_visibility: response.data } : current);
      setIsPrivacyModalOpen(false);
      showToast('공개 설정이 저장되었습니다.', 'success');
    } catch (error: any) {
      setPrivacySettings(savedPrivacySettings);
      showToast(error.message || '공개 설정 저장에 실패했습니다.', 'error');
    } finally {
      setIsPrivacySaving(false);
    }
  };

  const handleEmailEditStart = () => {
    setEmailForm(accountEmail);
    setIsEmailEditing(true);
  };

  const handleEmailEditCancel = () => {
    setEmailForm(accountEmail);
    setIsEmailEditing(false);
  };

  const handleEmailSave = async () => {
    const nextEmail = emailForm.trim();
    if (!nextEmail) {
      showToast('이메일을 입력해주세요.', 'error');
      return;
    }

    setIsEmailSaving(true);
    try {
      const response = await updateMyEmail(nextEmail);
      setProfile(response.data);
      setEmailForm(getProfileEmail(response.data));
      if (setCurrentUser) {
        setCurrentUser(response.data);
      }
      setIsEmailEditing(false);
      showToast('이메일이 수정되었습니다.', 'success');
    } catch (error: any) {
      showToast(error.message || '이메일 수정에 실패했습니다.', 'error');
    } finally {
      setIsEmailSaving(false);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isInitialLoading) return <Loading />;
  if (isError || !profile) return (
    <div className="max-w-5xl mx-auto px-4 py-32 text-center flex flex-col items-center">
      <div className="mb-6 rounded-full bg-stone-100 p-6"><AlertCircle size={48} className="text-stone-300" /></div>
      <h2 className="mb-2 text-2xl font-black text-[#25282b]">정보를 볼 수 없는 사용자입니다.</h2>
      <button onClick={() => router.back()} className="rounded-sm bg-[#e60000] px-8 py-3 font-bold text-white transition-opacity hover:opacity-90">이전으로 돌아가기</button>
    </div>
  );

  const displayBio = (profile.userDescription && profile.userDescription !== profile.nickname) ? profile.userDescription : '자기소개가 아직 없습니다.';
  const activityVisibility = profile.activity_visibility || allPublicVisibility;
  const profileTabs = [
    { id: 'logs', label: '내 로그', icon: BookOpen, count: profile.stats.total_log_count ?? profile.stats.total_photo_count ?? 0 },
    { id: 'visits', label: '방문기록', icon: MapPin, count: profile.stats.visited_restaurant_count ?? 0 },
    { id: 'posts', label: '게시글', icon: FileText, count: profile.stats.post_count ?? 0 },
    { id: 'comments', label: '댓글', icon: MessageSquare, count: profile.stats.comment_count ?? 0 },
    { id: 'bookmarks', label: '가고 싶은 가게', icon: Heart, count: profile.stats.total_bookmark_count, private: true },
  ].filter((tab) =>
    isOwnProfile || (!tab.private && activityVisibility[tab.id as keyof ActivityVisibility]),
  );
  const filteredLogItems = selectedLogShopId
    ? items.filter((item) => getLogShopId(item) === selectedLogShopId)
    : items;
  const selectedLogShop = logShopFilters.find((shop) => shop.id === selectedLogShopId);
  const visibleLogShopFilters = logShopFilters.filter((shop) =>
    shop.name.toLowerCase().includes(logShopSearchQuery.trim().toLowerCase()),
  );
  const accountEmail = getProfileEmail(profile);

  const toRamenLogItem = (item: any): RamenLogItem => item.shop && item.author ? item as RamenLog : ({
    id: Number(item.photo_id || item.id),
    author: {
      id: Number(profile.user_id || profile.id || userIdFromPath),
      name: profile.nickname,
      imageUrl: profile.profile_image_url || undefined,
    },
    shop: {
      id: getLogShopId(item) || undefined,
      name: item.restaurant_name || item.shopName || item.shop_name || '가게 정보 없음',
      location: item.location || item.simple_address || item.address_simple || undefined,
    },
    menuName: item.menuName || item.menu_name || '메뉴 기록',
    ramenType: item.ramenType || item.ramen_type,
    imageUrl: item.image_url || item.imageUrl,
    date: item.uploaded_at || item.createdAt || item.created_at || '',
    note: item.description || item.note || '',
    tasteNotes: item.tasteNotes || item.taste_notes || emptyTasteNotes(),
    revisit: item.revisit,
    likes: typeof item.likes === 'number' ? item.likes : undefined,
    isLiked: Boolean(item.isLiked ?? item.is_liked),
    isPublic: item.isPublic ?? item.is_public,
  });

  const EmptyState = ({ message, icon: Icon, tab }: { message: string; icon: any; tab: string }) => (
    <div className="flex flex-col items-center justify-center rounded-sm border border-dashed border-stone-300 bg-stone-50 py-20 text-center">
      <div className="mb-4 rounded-full border border-stone-100 bg-white p-5"><Icon className="h-10 w-10 text-stone-300" /></div>
      <p className="text-stone-500 font-bold mb-6">{message}</p>
      <Link href={tab === 'logs' ? '/ramen-log' : tab === 'posts' || tab === 'comments' ? '/community' : '/shops'} className="inline-flex items-center gap-2 rounded-sm bg-[#e60000] px-8 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90">
        {tab === 'logs' ? '라멘로그 기록하기' : tab === 'posts' || tab === 'comments' ? '커뮤니티 가기' : '맛집 찾아보기'} <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 pb-32">
      {/* Profile Header */}
      <div className="group relative mb-8 overflow-hidden rounded-sm border border-stone-200 bg-white">
        <div className="relative h-48 overflow-hidden bg-[#25282b] md:h-64">
          {(editForm.backgroundImage || (profile.background_image_url && !markedForDelete.background)) ? (
            <img src={editForm.backgroundImage || profile.background_image_url} alt="Cover" className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity" onClick={() => handleZoomImage(editForm.backgroundImage || profile.background_image_url, '배경 이미지')} />
          ) : (
            <div className="relative h-full w-full bg-[#25282b]" />
          )}

          {isEditing && isOwnProfile && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3 z-20">
              <label className="flex cursor-pointer items-center gap-2 rounded-sm bg-white px-5 py-2.5 text-sm font-black text-[#25282b] transition-colors hover:bg-stone-100">
                <Camera className="w-4 h-4" /> 배경 변경
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'backgroundImage')} />
              </label>
              {(editForm.backgroundImage || profile.background_image_url) && !markedForDelete.background && (
                <button onClick={() => handleImageDelete('background')} className="rounded-full border border-white/20 bg-[#25282b] p-2.5 text-white transition-colors hover:bg-[#e60000]">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="px-6 pb-6 md:px-10 md:pb-10 flex flex-col md:flex-row items-center md:items-start gap-6 -mt-16 md:-mt-20 relative z-30">
          <div className="relative">
            <div className="relative h-32 w-32 cursor-pointer overflow-hidden rounded-full border-4 border-white bg-white md:h-40 md:w-40" onClick={() => handleZoomImage(editForm.profileImage || profile.profile_image_url, '프로필 이미지')}>
              {(editForm.profileImage || (profile.profile_image_url && !markedForDelete.profile)) ? (
                <img src={editForm.profileImage || profile.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl bg-stone-100 text-stone-300">🍜</div>
              )}
              {isEditing && isOwnProfile && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                  <label className="cursor-pointer text-white transition-colors hover:text-[#e60000]">
                    <Camera className="w-8 h-8" />
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'profileImage')} />
                  </label>
                </div>
              )}
            </div>
            {isEditing && isOwnProfile && (editForm.profileImage || profile.profile_image_url) && !markedForDelete.profile && (
              <button
                onClick={(e) => { e.stopPropagation(); handleImageDelete('profile'); }}
                className="absolute -right-1 -top-1 z-40 rounded-full border-2 border-white bg-[#25282b] p-1.5 text-white transition-colors hover:bg-[#e60000]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex-1 w-full md:w-auto text-center md:text-left md:pt-[104px] pt-2">
            {isEditing ? (
              <div className="relative z-40 rounded-sm border border-stone-200 bg-white p-4">
                <div className="space-y-4">
                  <input type="text" value={editForm.nickname} onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })} className="w-full rounded-sm border border-stone-200 bg-white px-4 py-2 text-xl font-bold outline-none focus:border-[#e60000]" />
                  <div className="relative">
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value.slice(0, 150) })}
                      placeholder="자기소개를 입력하세요"
                      className="w-full rounded-sm border border-stone-200 bg-white px-4 py-2 pr-16 text-sm outline-none focus:border-[#e60000]"
                      rows={2}
                      maxLength={150}
                    />
                    <div className="absolute right-3 bottom-2 text-xs text-stone-400">
                      {(editForm.bio || '').length}/150
                    </div>
                  </div>
                  <div className="flex gap-2 justify-center md:justify-start">
                    <button onClick={handleSave} disabled={isSubmitting} className="rounded-sm bg-[#e60000] px-6 py-2 font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50">저장</button>
                    <button onClick={handleEditCancel} disabled={isSubmitting} className="rounded-sm border border-stone-200 bg-stone-100 px-6 py-2 font-bold text-stone-600 transition-colors hover:bg-stone-200 hover:text-[#25282b] disabled:opacity-50">취소</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative z-10">
                <h2 className="mb-1 text-3xl font-black tracking-tight text-[#25282b]">{profile.nickname}</h2>
                <p className="text-sm font-medium text-[#7e7e7e] flex flex-wrap items-center justify-center md:justify-start gap-x-2">
                  <span className={isBioExpanded ? "break-all" : "truncate max-w-[280px] sm:max-w-[400px] md:max-w-[500px]"}>
                    {displayBio}
                  </span>
                  {displayBio && displayBio !== '자기소개가 아직 없습니다.' && displayBio.length > 45 && (
                    <button
                      type="button"
                      onClick={() => setIsBioExpanded(!isBioExpanded)}
                      className="inline-flex items-center gap-0.5 text-xs font-bold text-stone-400 hover:text-stone-600 transition-colors flex-shrink-0"
                    >
                      <span>{isBioExpanded ? '접기' : '더보기'}</span>
                      {isBioExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </p>
              </div>
            )}
          </div>

          <div className="relative z-10 mt-4 w-full md:mt-0 md:w-auto md:pt-[104px]">
            {isOwnProfile && !isEditing && (
              <div className="grid w-full grid-cols-2 gap-2 md:w-40 md:grid-cols-1">
                <button onClick={handleEditStart} className="inline-flex items-center justify-center gap-2 rounded-sm border border-[#e60000] bg-white px-5 py-2.5 text-xs font-black uppercase tracking-[0.16em] text-[#25282b] transition-colors hover:bg-[#e60000] hover:text-white">
                  <Edit3 className="h-3.5 w-3.5" />
                  프로필 수정
                </button>
                <button onClick={openPrivacyModal} className="inline-flex items-center justify-center gap-2 rounded-sm border border-stone-200 bg-white px-5 py-2.5 text-xs font-black uppercase tracking-[0.16em] text-[#25282b] transition-colors hover:border-[#e60000] hover:text-[#e60000]">
                  <Shield className="h-3.5 w-3.5" />
                  공개 설정
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isOwnProfile && (
        <section className="mb-8 rounded-sm border border-stone-200 bg-white px-4 py-3 md:px-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-red-50 text-[#e60000]">
                <Mail className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-black text-[#25282b]">이메일 정보</h3>
                  <span className="rounded-sm bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-500">비공개</span>
                </div>
                <p className="mt-1 truncate text-sm font-bold text-stone-700">
                  {accountEmail || '등록된 이메일 정보 없음'}
                </p>
                <p className="mt-1 text-xs font-medium text-stone-400">
                  계정 알림과 이벤트 안내에 사용하는 이메일입니다.
                </p>
              </div>
            </div>
            {isEmailEditing ? (
              <div className="w-full md:w-[360px]">
                <label htmlFor="account-email" className="sr-only">이메일</label>
                <input
                  id="account-email"
                  type="email"
                  value={emailForm}
                  onChange={(event) => setEmailForm(event.target.value)}
                  placeholder="new@example.com"
                  className="h-11 w-full rounded-sm border border-stone-200 bg-white px-3 text-sm font-bold text-[#25282b] outline-none transition-colors placeholder:text-stone-300 focus:border-[#e60000]"
                  autoComplete="email"
                  disabled={isEmailSaving}
                />
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleEmailEditCancel}
                    disabled={isEmailSaving}
                    className="inline-flex h-11 items-center justify-center rounded-sm border border-stone-200 bg-stone-50 px-4 text-xs font-black text-stone-500 transition-colors hover:bg-stone-100 hover:text-[#25282b] disabled:opacity-50"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={handleEmailSave}
                    disabled={isEmailSaving}
                    className="inline-flex h-11 items-center justify-center rounded-sm bg-[#e60000] px-4 text-xs font-black text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {isEmailSaving ? '저장 중' : '저장'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleEmailEditStart}
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-stone-200 bg-white px-5 py-2.5 text-xs font-black uppercase tracking-[0.16em] text-[#25282b] transition-colors hover:border-[#e60000] hover:text-[#e60000]"
              >
                <Edit3 className="h-3.5 w-3.5" />
                이메일 수정
              </button>
            )}
          </div>
        </section>
      )}

      {/* Tabs */}
      <div className="mb-8 flex overflow-x-auto border-b border-stone-200 scrollbar-hide">
        {profileTabs.map(tab => (
          <button key={tab.id} onClick={() => handleTabChange(tab.id)} className={`whitespace-nowrap border-b-2 px-6 py-4 text-xs font-bold transition-colors ${activeTab === tab.id ? 'border-[#e60000] text-[#25282b]' : 'border-transparent text-stone-500 hover:text-[#25282b]'}`}>
            <div className="flex items-center"><tab.icon className="mr-2 h-3.5 w-3.5" />{tab.label}<span className={`ml-1 ${activeTab === tab.id ? 'text-[#e60000]' : 'text-stone-400'}`}>({tab.count})</span></div>
          </button>
        ))}
      </div>

      <div className="min-h-[400px] pb-20 relative">
        {activeTab === 'logs' && (
          <div className="mb-6 flex flex-col gap-3 border-b border-stone-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e60000]">가게별 보기</p>
              <p className="mt-1 text-xs font-medium text-stone-400">방문기록에 있는 가게를 기준으로 분류합니다.</p>
            </div>

            <div className="flex items-center gap-3">
              {selectedLogShopId && (
                <span className="shrink-0 text-xs font-black text-stone-400">
                  {filteredLogItems.length}개 로그
                </span>
              )}

              <div ref={logShopDropdownRef} className="relative w-full sm:w-56">
                <button
                  type="button"
                  onClick={() => setIsLogShopDropdownOpen((current) => !current)}
                  className="flex h-11 w-full items-center justify-between gap-2 rounded-sm border border-stone-200 bg-white px-3 text-sm font-bold text-[#25282b] transition-colors hover:border-[#e60000]"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-[#e60000]" />
                    <span className="truncate">{selectedLogShop?.name || '전체 가게'}</span>
                  </span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-stone-400 transition-transform ${isLogShopDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isLogShopDropdownOpen && (
                  <div className="absolute right-0 z-30 mt-2 flex max-h-72 w-full flex-col overflow-hidden rounded-sm border border-stone-200 bg-white shadow-lg sm:w-64">
                    <div className="border-b border-stone-100 bg-stone-50 p-2">
                      <div className="relative">
                        <MapPin className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
                        <input
                          type="search"
                          value={logShopSearchQuery}
                          onChange={(event) => setLogShopSearchQuery(event.target.value)}
                          placeholder="방문한 가게 검색"
                          className="w-full rounded-sm border border-stone-200 bg-white py-2 pl-8 pr-3 text-xs outline-none focus:border-[#e60000]"
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="overflow-y-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLogShopId(null);
                          setIsLogShopDropdownOpen(false);
                          setLogShopSearchQuery('');
                        }}
                        className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-stone-50 ${
                          selectedLogShopId === null ? 'font-semibold text-[#e60000]' : 'text-stone-700'
                        }`}
                      >
                        전체 가게
                      </button>

                      {visibleLogShopFilters.map((shop) => (
                        <button
                          key={shop.id}
                          type="button"
                          onClick={() => {
                            setSelectedLogShopId(shop.id);
                            setIsLogShopDropdownOpen(false);
                            setLogShopSearchQuery('');
                          }}
                          className={`w-full border-t border-stone-100 px-4 py-2.5 text-left text-sm transition-colors hover:bg-stone-50 ${
                            selectedLogShopId === shop.id ? 'font-semibold text-[#e60000]' : 'text-stone-700'
                          }`}
                        >
                          <span className="block truncate">{shop.name}</span>
                        </button>
                      ))}

                      {visibleLogShopFilters.length === 0 && (
                        <p className="px-4 py-6 text-center text-xs font-bold text-stone-400">검색된 가게가 없습니다.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {isLoading && (!pageMeta || pageMeta.number === 0) && (
          <div className="absolute inset-0 z-10 flex justify-center bg-white/50 pt-20"><Loader2 className="h-10 w-10 animate-spin text-[#e60000]" /></div>
        )}
        {(activeTab === 'logs' ? filteredLogItems.length > 0 : items.length > 0) ? (
          activeTab === 'logs' ? (
            <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredLogItems.map((item, index) => {
                const log = toRamenLogItem(item);
                return (
                  <div key={`logs-${log.id}-${index}`} className="h-full">
                    <RamenLogCard log={log} onClick={setSelectedPhoto} />
                  </div>
                );
              })}
            </div>
          ) : (
          <div className="flex flex-col gap-3">
            {items.map((item, index) => {
              const itemId = item.photo_id || getShopId(item) || item.post_id || item.postId || item.commentId || item.id || 'no-id';
              const uniqueKey = `${activeTab}-${itemId}-${index}`;
              if (activeTab === 'visits' || activeTab === 'bookmarks') return (
                <Link key={uniqueKey} href={`/shop/${getShopId(item)}`} ref={items.length === index + 1 ? lastItemRef : null} className="group flex items-center gap-4 rounded-md border border-stone-200 bg-white p-4 transition-colors hover:border-[#e60000]">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-stone-100"><img src={getShopImageUrl(item)} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" /></div>
                  <div className="flex-1 min-w-0">
                    <h4 className="truncate text-lg font-bold text-[#25282b] transition-colors group-hover:text-[#e60000]">{getShopName(item)}</h4>
                    <p className="text-sm text-stone-500 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {getShopAddress(item)}</p>
                  </div>
                  {activeTab === 'visits' && <div className="flex min-w-[100px] flex-shrink-0 flex-col items-end justify-center text-right"><div className="flex items-center gap-1 font-bold text-[#e60000]"><Award className="h-4 w-4" /> <span>{item.visit_count_for_user}회 방문</span></div><p className="mt-1 text-xs text-stone-400">{new Date(item.last_visited_at).toLocaleDateString('ko-KR')}</p></div>}
                </Link>
              );
              if (activeTab === 'posts') return (
                <Link key={uniqueKey} href={`/community/${item.post_id || item.postId || item.id}`} ref={items.length === index + 1 ? lastItemRef : null} className="group block rounded-md border border-stone-200 bg-white p-4 transition-colors hover:border-[#e60000]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="mb-2 flex items-center gap-2"><span className="rounded-sm border border-[#e60000] bg-white px-2 py-1 text-[10px] font-black uppercase text-[#25282b]">{getCategoryLabel(item.category)}</span> {item.storeName && <span className="text-[10px] font-bold uppercase tracking-tighter text-stone-400">@ {item.storeName}</span>}</div>
                      <h4 className="truncate text-lg font-bold text-[#25282b] transition-colors group-hover:text-[#e60000]">{item.title}</h4>
                      <p className="text-sm text-stone-500 mt-2 line-clamp-1 leading-relaxed">{stripHtml(item.contentPreview)}</p>
                      <div className="flex items-center gap-4 mt-3 text-[10px] font-black uppercase text-stone-400 tracking-widest"><span>{new Date(item.createdAt).toLocaleDateString('ko-KR')}</span><span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {item.likeCount}</span><span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {item.commentCount}</span></div>
                    </div>
                    {item.imageUrl && <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-stone-100 bg-stone-100"><img src={item.imageUrl} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" /></div>}
                  </div>
                </Link>
              );
              if (activeTab === 'comments') return (
                <Link key={uniqueKey} href={`/community/${item.post_id || item.postId}`} ref={items.length === index + 1 ? lastItemRef : null} className="group block rounded-md border border-stone-200 bg-white p-4 transition-colors hover:border-[#e60000]">
                  <p className="text-stone-800 font-medium mb-2 line-clamp-2">"{item.content}"</p>
                  <div className="flex items-center justify-between text-sm text-stone-500"><div className="flex items-center gap-2">{item.postTitle && <span className="max-w-[200px] truncate text-stone-400 transition-colors group-hover:text-[#e60000] md:max-w-[400px]">원본글 보기 <ArrowRight className="ml-1 inline h-2.5 w-2.5" /></span>}<span>{new Date(item.createdAt).toLocaleDateString('ko-KR')}</span></div>{item.taggedParentAuthorNickname && <span className="font-bold text-[#e60000]">@ {item.taggedParentAuthorNickname}</span>}</div>
                </Link>
              );
              return null;
            })}
          </div>
          )
        ) : !isLoading && !(activeTab === 'logs' && pageMeta?.hasNext) && <EmptyState tab={activeTab} message={activeTab === 'none' ? '공개된 활동이 없습니다.' : activeTab === 'logs' ? (selectedLogShopId ? '이 가게에 남긴 라멘로그가 없습니다.' : '아직 남긴 라멘로그가 없습니다.') : '아직 항목이 없습니다.'} icon={activeTab === 'logs' ? BookOpen : activeTab === 'visits' ? MapPin : activeTab === 'bookmarks' ? Heart : activeTab === 'posts' ? FileText : MessageSquare} />}
        {activeTab === 'logs' && pageMeta?.hasNext && !isLoading && (
          <div ref={lastItemRef} className="h-1" aria-hidden="true" />
        )}
        {isLoading && pageMeta && pageMeta.number > 0 && <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-[#e60000]" /></div>}
      </div>
      {isOwnProfile && (
        <div className="flex justify-end border-t border-stone-200 pt-6">
          <Link href="/mypage/withdraw" className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-400 transition-colors hover:text-[#e60000]">
            <Trash2 className="h-3.5 w-3.5" />
            회원 탈퇴
          </Link>
        </div>
      )}
      {selectedPhoto && <PhotoModal photo={'shop' in selectedPhoto ? {
        id: selectedPhoto.id,
        imageUrl: selectedPhoto.imageUrl,
        menuName: selectedPhoto.menuName,
        user: selectedPhoto.author.name,
        userId: selectedPhoto.author.id,
        restaurantName: selectedPhoto.shop.name,
        restaurantId: selectedPhoto.shop.id,
        date: formatRamenLogDate(selectedPhoto.date),
        comment: selectedPhoto.note || '',
        revisit: selectedPhoto.revisit,
        likes: selectedPhoto.likes,
        isLiked: selectedPhoto.isLiked,
        tasteNotes: tasteNoteOrder
          .filter((key) => selectedPhoto.tasteNotes?.[key]?.length)
          .map((key) => ({ label: tasteNoteLabels[key], values: selectedPhoto.tasteNotes?.[key] || [] })),
      } : {
        id: selectedPhoto.photo_id || selectedPhoto.id,
        imageUrl: selectedPhoto.image_url,
        menuName: selectedPhoto.menuName || '이미지 보기',
        restaurantName: selectedPhoto.restaurant_name || '사용자 프로필',
        restaurantId: selectedPhoto.restaurant_id,
        date: selectedPhoto.uploaded_at ? new Date(selectedPhoto.uploaded_at).toLocaleDateString('ko-KR') : '-',
        comment: selectedPhoto.description || '',
        isUserPhoto: selectedPhoto.isUserPhoto,
      }} onClose={() => setSelectedPhoto(null)} onLikeChange={handleLogLikeChange} onEdit={handleEditLog} onDelete={handleDeleteLog} disableNavigation={false} />}

      <RamenLogModal
        isOpen={Boolean(editingLog)}
        onClose={() => setEditingLog(null)}
        onCreate={handleUpdateLog}
        initialLog={editingLog ? {
          shopName: editingLog.shop.name,
          shopId: editingLog.shop.id,
          menuName: editingLog.menuName,
          ramenType: editingLog.ramenType || '기타',
          visitedAt: editingLog.date,
          imageUrl: editingLog.imageUrl,
          imageName: '',
          note: editingLog.note || '',
          tasteNotes: editingLog.tasteNotes || emptyTasteNotes(),
          revisit: editingLog.revisit || '자주 감',
          isPublic: editingLog.isPublic ?? true,
        } : undefined}
      />

      {/* Privacy Settings Modal */}
      {isPrivacyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={closePrivacyModal} />
          <div className="relative w-full max-w-md overflow-hidden rounded-sm border border-stone-200 bg-white animate-scale-in">
            <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
              <div>
                <h3 className="text-base font-black text-[#25282b]">공개 설정</h3>
                <p className="mt-0.5 text-[11px] font-medium text-stone-500">다른 사용자에게 보여질 탭을 선택하세요.</p>
              </div>
              <button
                type="button"
                onClick={closePrivacyModal}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-400 transition-colors hover:border-[#e60000] hover:text-[#e60000]"
                aria-label="공개 설정 모달 닫기"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-1">
              {[
                { key: 'logs' as const, label: '내 로그', description: '내가 남긴 라멘로그', icon: BookOpen },
                { key: 'visits' as const, label: '방문기록', description: '방문한 가게 목록', icon: MapPin },
                { key: 'posts' as const, label: '게시글', description: '커뮤니티 작성 글', icon: FileText },
                { key: 'comments' as const, label: '댓글', description: '커뮤니티 작성 댓글', icon: MessageSquare },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between rounded-sm px-4 py-3.5 transition-colors hover:bg-stone-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-sm border border-stone-200 bg-stone-50">
                      <item.icon className="h-4 w-4 text-stone-500" />
                    </div>
                    <div>
                      <span className="block text-sm font-black text-[#25282b]">{item.label}</span>
                      <span className="block text-[11px] font-medium text-stone-400">{item.description}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">
                      {privacySettings[item.key] ? (
                        <span className="flex items-center gap-1 text-[#25282b]"><Eye className="h-3 w-3" />공개</span>
                      ) : (
                        <span className="flex items-center gap-1 text-stone-400"><EyeOff className="h-3 w-3" />비공개</span>
                      )}
                    </span>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={privacySettings[item.key]}
                        onChange={(e) => setPrivacySettings(prev => ({ ...prev, [item.key]: e.target.checked }))}
                        className="peer sr-only"
                      />
                      <div className="relative h-6 w-11 rounded-full bg-stone-200 transition-colors peer-checked:bg-[#e60000] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-5"></div>
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-stone-100 px-6 py-4 flex items-center justify-between">
              <p className="text-[11px] font-medium text-stone-400">비공개 항목은 나만 볼 수 있습니다.</p>
              <button
                onClick={handlePrivacySave}
                disabled={isPrivacySaving}
                className="rounded-sm bg-[#e60000] px-6 py-2.5 text-xs font-black text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPrivacySaving ? '저장 중' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
