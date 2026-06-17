'use client';

import { useState, useEffect, useRef, useCallback, use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Camera, MapPin, Heart, Award, FileText, MessageSquare, X, Loader2, ArrowRight, Edit3, AlertCircle, Trash2 } from 'lucide-react';
import PhotoModal from '../../../components/PhotoModal';
import { useApp } from '../../../context/AppContext';
import { 
  getMyProfile, 
  getUserProfile,
  getMyVisits, 
  getUserVisits,
  getMyBookmarks, 
  getMyPosts, 
  getUserPosts,
  getMyPhotos, 
  getUserPhotos,
  getMyComments,
  getUserComments,
  updateUserProfile,
  MyProfileData,
  PageMeta
} from '@/lib/api/user';
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

const getShopId = (item: any) =>
  item.restaurant_id || item.shopId || item.shop_id || item.ramenShopId || item.ramen_shop_id || item.id;

const getShopName = (item: any) =>
  item.restaurant_name || item.restaurantName || item.shopName || item.shop_name || item.name || '이름 미정';

const getShopImageUrl = (item: any) =>
  item.restaurant_image_url || item.shopImageUrl || item.shop_image_url || item.thumbnailUrl || item.thumbnail_url || item.imageUrl || item.image_url || '/hero-home.jpg';

const getShopAddress = (item: any) =>
  item.simple_address || item.address_simple || item.region || item.address || item.location || '주소 정보 없음';

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const userIdFromPath = resolvedParams.id;
  const { isLoggedIn, showToast, currentUser, setCurrentUser } = useApp();
  
  const [activeTab, setActiveTab] = useState('photos');
  const [profile, setProfile] = useState<MyProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
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

  const isOwnProfile = useMemo(() => {
    if (!currentUser) return false;
    const myId = String(currentUser.user_id || currentUser.id);
    return myId === String(userIdFromPath);
  }, [currentUser, userIdFromPath]);

  const fetchProfile = useCallback(async () => {
    setIsInitialLoading(true);
    setIsError(false);
    try {
      const res = isOwnProfile ? await getMyProfile() : await getUserProfile(userIdFromPath);
      setProfile(res.data);
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
    setIsLoading(true);
    try {
      let res;
      if (isOwnProfile) {
        switch (activeTab) {
          case 'photos': res = await getMyPhotos(page); break;
          case 'visits': res = await getMyVisits(page); break;
          case 'bookmarks': res = await getMyBookmarks(page); break;
          case 'posts': res = await getMyPosts(page); break;
          case 'comments': res = await getMyComments(page); break;
          default: return;
        }
      } else {
        switch (activeTab) {
          case 'photos': res = await getUserPhotos(userIdFromPath, page); break;
          case 'posts': res = await getUserPosts(userIdFromPath, page); break;
          case 'comments': res = await getUserComments(userIdFromPath, page); break;
          case 'visits': res = await getUserVisits(userIdFromPath, page); break;
          default: return;
        }
      }
      
      if (res && res.data) {
        const validItems = (res.data.items || []).filter((item: any) => {
          if (activeTab === 'photos') return !!(item.photo_id || item.id);
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
  }, [activeTab, isOwnProfile, userIdFromPath, isError]);

  useEffect(() => {
    fetchTabData(0);
  }, [fetchTabData]);

  const loadMore = () => {
    if (pageMeta && pageMeta.hasNext) {
      fetchTabData(pageMeta.number + 1);
    }
  };

  const handleTabChange = (tab: string) => {
    setItems([]);
    setPageMeta(null);
    if (tab === activeTab) {
      fetchTabData(0);
      return;
    }
    setActiveTab(tab);
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

  const EmptyState = ({ message, icon: Icon, tab }: { message: string; icon: any; tab: string }) => (
    <div className="flex flex-col items-center justify-center rounded-sm border border-dashed border-stone-300 bg-stone-50 py-20 text-center">
      <div className="mb-4 rounded-full border border-stone-100 bg-white p-5"><Icon className="h-10 w-10 text-stone-300" /></div>
      <p className="text-stone-500 font-bold mb-6">{message}</p>
      <Link href={tab === 'posts' || tab === 'comments' ? '/community' : '/shops'} className="inline-flex items-center gap-2 rounded-sm bg-[#e60000] px-8 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90">
        {tab === 'posts' || tab === 'comments' ? '커뮤니티 가기' : '맛집 찾아보기'} <ArrowRight className="w-4 h-4" />
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

          <div className="flex-1 w-full md:w-auto text-center md:text-left md:pt-6 pt-2">
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
                <p className="text-sm font-medium text-[#7e7e7e]">{displayBio}</p>
              </div>
            )}
          </div>

          <div className="mt-4 md:mt-0 md:pt-6 relative z-10">
            {isOwnProfile && !isEditing && (
              <button onClick={handleEditStart} className="inline-flex items-center justify-center gap-2 rounded-sm border border-[#e60000] bg-white px-5 py-2.5 text-xs font-black uppercase tracking-[0.16em] text-[#25282b] transition-colors hover:bg-[#e60000] hover:text-white">
                <Edit3 className="h-3.5 w-3.5" />
                프로필 수정
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex overflow-x-auto border-b border-stone-200 scrollbar-hide">
        {[
          { id: 'photos', label: '사진', icon: Camera, count: profile.stats.total_photo_count },
          { id: 'visits', label: '방문기록', icon: MapPin, count: profile.stats.visited_restaurant_count },
          { id: 'posts', label: '게시글', icon: FileText, count: profile.stats.post_count },
          { id: 'comments', label: '댓글', icon: MessageSquare, count: profile.stats.comment_count },
          { id: 'bookmarks', label: '북마크', icon: Heart, count: profile.stats.total_bookmark_count, private: true }
        ].filter(tab => isOwnProfile || !tab.private).map(tab => (
          <button key={tab.id} onClick={() => handleTabChange(tab.id)} className={`whitespace-nowrap border-b-2 px-6 py-4 text-xs font-bold transition-colors ${activeTab === tab.id ? 'border-[#e60000] text-[#25282b]' : 'border-transparent text-stone-500 hover:text-[#25282b]'}`}>
            <div className="flex items-center"><tab.icon className="mr-2 h-3.5 w-3.5" />{tab.label}<span className={`ml-1 ${activeTab === tab.id ? 'text-[#e60000]' : 'text-stone-400'}`}>({tab.count})</span></div>
          </button>
        ))}
      </div>

      <div className="min-h-[400px] pb-20 relative">
        {isLoading && (!pageMeta || pageMeta.number === 0) && (
          <div className="absolute inset-0 z-10 flex justify-center bg-white/50 pt-20"><Loader2 className="h-10 w-10 animate-spin text-[#e60000]" /></div>
        )}
        {items.length > 0 ? (
          <div className={activeTab === 'photos' ? "grid grid-cols-3 gap-1 md:gap-4" : "flex flex-col gap-3"}>
            {items.map((item, index) => {
              const itemId = item.photo_id || getShopId(item) || item.post_id || item.postId || item.commentId || item.id || 'no-id';
              const uniqueKey = `${activeTab}-${itemId}-${index}`;
              if (activeTab === 'photos') return (
                <div key={uniqueKey} ref={items.length === index + 1 ? lastItemRef : null} className="group relative aspect-square overflow-hidden rounded-md border border-stone-200 bg-stone-100">
                  <img src={item.image_url} alt={item.menuName} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03] cursor-pointer" onClick={() => setSelectedPhoto(item)} />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pointer-events-none">
                    <p className="text-white text-xs font-bold truncate">{item.menuName}</p>
                    <Link href={`/shop/${item.restaurant_id}`} className="text-stone-300 text-[10px] hover:text-white hover:underline transition-all pointer-events-auto flex items-center gap-1 mt-0.5"><MapPin className="w-2.5 h-2.5" />{item.restaurant_name}</Link>
                  </div>
                </div>
              );
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
        ) : !isLoading && <EmptyState tab={activeTab} message={`아직 항목이 없습니다.`} icon={activeTab === 'photos' ? Camera : activeTab === 'visits' ? MapPin : activeTab === 'bookmarks' ? Heart : activeTab === 'posts' ? FileText : MessageSquare} />}
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
      {selectedPhoto && <PhotoModal photo={{ id: selectedPhoto.photo_id || selectedPhoto.id, imageUrl: selectedPhoto.image_url, menuName: selectedPhoto.menuName || '이미지 보기', restaurantName: selectedPhoto.restaurant_name || '사용자 프로필', restaurantId: selectedPhoto.restaurant_id, date: selectedPhoto.uploaded_at ? new Date(selectedPhoto.uploaded_at).toLocaleDateString('ko-KR') : '-', comment: selectedPhoto.description || '', isUserPhoto: selectedPhoto.isUserPhoto }} onClose={() => setSelectedPhoto(null)} disableNavigation={false} />}
    </div>
  );
}
