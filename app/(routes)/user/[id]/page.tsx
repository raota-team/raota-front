'use client';

import { useState, useEffect, useRef, useCallback, use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Camera, MapPin, Heart, Award, FileText, MessageSquare, X, Loader2, ArrowRight, User as UserIcon, Check, Edit3, AlertCircle, RefreshCcw } from 'lucide-react';
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
          if (activeTab === 'visits' || activeTab === 'bookmarks') return !!(item.restaurant_id || item.id);
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

  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
    setItems([]);
    setPageMeta(null);
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
      <div className="bg-stone-100 p-6 rounded-full mb-6"><AlertCircle size={48} className="text-stone-300" /></div>
      <h2 className="text-2xl font-black text-stone-900 mb-2">정보를 볼 수 없는 사용자입니다.</h2>
      <button onClick={() => router.back()} className="bg-stone-900 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-red-600 transition-colors">이전으로 돌아가기</button>
    </div>
  );

  const displayBio = (profile.userDescription && profile.userDescription !== profile.nickname) ? profile.userDescription : '자기소개가 아직 없습니다.';

  const EmptyState = ({ message, icon: Icon, tab }: { message: string; icon: any; tab: string }) => (
    <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-stone-300 rounded-xl bg-stone-50/50">
      <div className="bg-white p-5 rounded-full mb-4 shadow-sm border border-stone-100"><Icon className="w-10 h-10 text-stone-300" /></div>
      <p className="text-stone-500 font-bold mb-6">{message}</p>
      <Link href={tab === 'posts' || tab === 'comments' ? '/community' : '/shops'} className="inline-flex items-center gap-2 bg-stone-900 hover:bg-red-600 text-white px-8 py-3 rounded-full font-bold text-sm transition-all shadow-lg">
        {tab === 'posts' || tab === 'comments' ? '커뮤니티 가기' : '맛집 찾아보기'} <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-32">
      {/* Profile Header */}
      <div className="bg-white border border-stone-200 mb-8 shadow-sm rounded-xl overflow-hidden relative group">
        <div className="h-48 md:h-64 bg-stone-800 relative overflow-hidden">
          {(editForm.backgroundImage || (profile.background_image_url && !markedForDelete.background)) ? (
            <img src={editForm.backgroundImage || profile.background_image_url} alt="Cover" className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity" onClick={() => handleZoomImage(editForm.backgroundImage || profile.background_image_url, '배경 이미지')} />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-stone-800 to-stone-900 relative">
              <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            </div>
          )}

          {isEditing && isOwnProfile && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3 z-20">
              <label className="bg-white hover:bg-stone-100 text-stone-800 px-5 py-2.5 rounded-full text-sm font-black shadow-xl cursor-pointer transition-all active:scale-95 flex items-center gap-2">
                <Camera className="w-4 h-4" /> 배경 변경
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'backgroundImage')} />
              </label>
              {(editForm.backgroundImage || profile.background_image_url) && !markedForDelete.background && (
                <button onClick={() => handleImageDelete('background')} className="bg-stone-900/90 hover:bg-red-600 text-white p-2.5 rounded-full shadow-xl transition-all active:scale-95 border border-white/20">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="px-6 pb-6 md:px-10 md:pb-10 flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 md:-mt-20 relative z-30">
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white relative cursor-pointer" onClick={() => handleZoomImage(editForm.profileImage || profile.profile_image_url, '프로필 이미지')}>
              {(editForm.profileImage || (profile.profile_image_url && !markedForDelete.profile)) ? (
                 <img src={editForm.profileImage || profile.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl bg-stone-100 text-stone-300">🍜</div>
              )}
              {isEditing && isOwnProfile && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                  <label className="text-white cursor-pointer hover:text-orange-400 transition-colors">
                    <Camera className="w-8 h-8" />
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'profileImage')} />
                  </label>
                </div>
              )}
            </div>
            {isEditing && isOwnProfile && (editForm.profileImage || profile.profile_image_url) && !markedForDelete.profile && (
              <button 
                onClick={(e) => { e.stopPropagation(); handleImageDelete('profile'); }}
                className="absolute -top-1 -right-1 bg-stone-900 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors z-40 border-2 border-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex-1 w-full md:w-auto text-center md:text-left">
            {isEditing ? (
              <div className="bg-white/80 backdrop-blur-md border border-stone-200 rounded-xl p-4 shadow-lg relative z-40">
                <div className="space-y-4">
                  <input type="text" value={editForm.nickname} onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })} className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg font-bold text-xl outline-none" />
                  <textarea value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} placeholder="자기소개를 입력하세요" className="w-full px-4 py-2 bg-white border border-stone-200 rounded-lg text-sm outline-none" rows={2} />
                  <div className="flex gap-2 justify-center md:justify-start">
                    <button onClick={handleSave} disabled={isSubmitting} className="px-6 py-2 bg-stone-900 text-white font-bold rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50">저장</button>
                    <button onClick={handleEditCancel} disabled={isSubmitting} className="px-6 py-2 bg-stone-100 text-stone-600 font-bold rounded-lg border border-stone-200 hover:bg-stone-200 hover:text-stone-900 transition-colors disabled:opacity-50">취소</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative z-10">
                <h2 className="text-3xl font-black text-stone-900 mb-1 tracking-tight">{profile.nickname}</h2>
                <p className="text-stone-500 text-sm font-medium">{displayBio}</p>
              </div>
            )}
          </div>

          <div className="mt-4 md:mt-0 relative z-10">
            {isOwnProfile && !isEditing && (
              <button onClick={handleEditStart} className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-5 py-2.5 text-xs font-black uppercase tracking-[0.16em] text-red-700 shadow-sm transition-all hover:border-red-600 hover:bg-red-600 hover:text-white active:scale-[0.98]">
                <Edit3 className="h-3.5 w-3.5" />
                프로필 수정
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 mb-8 overflow-x-auto scrollbar-hide">
        {[
          { id: 'photos', label: '사진', icon: Camera, count: profile.stats.total_photo_count },
          { id: 'visits', label: '방문기록', icon: MapPin, count: profile.stats.visited_restaurant_count },
          { id: 'posts', label: '게시글', icon: FileText, count: profile.stats.post_count },
          { id: 'comments', label: '댓글', icon: MessageSquare, count: profile.stats.comment_count },
          { id: 'bookmarks', label: '북마크', icon: Heart, count: profile.stats.total_bookmark_count, private: true }
        ].filter(tab => isOwnProfile || !tab.private).map(tab => (
          <button key={tab.id} onClick={() => handleTabChange(tab.id)} className={`px-6 py-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'border-red-600 text-stone-900' : 'border-transparent text-stone-500 hover:text-stone-700'}`}>
            <div className="flex items-center"><tab.icon className="w-3.5 h-3.5 mr-2" />{tab.label}<span className={`ml-1 ${activeTab === tab.id ? 'text-red-600' : 'text-stone-400'}`}>({tab.count})</span></div>
          </button>
        ))}
      </div>

      <div className="min-h-[400px] pb-20 relative">
        {isLoading && (!pageMeta || pageMeta.number === 0) && (
          <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[1px] flex justify-center pt-20"><Loader2 className="w-10 h-10 text-red-600 animate-spin" /></div>
        )}
        {items.length > 0 ? (
          <div className={activeTab === 'photos' ? "grid grid-cols-3 gap-1 md:gap-4" : "flex flex-col gap-3"}>
            {items.map((item, index) => {
              const itemId = item.photo_id || item.restaurant_id || item.post_id || item.postId || item.commentId || item.id || 'no-id';
              const uniqueKey = `${activeTab}-${itemId}-${index}`;
              if (activeTab === 'photos') return (
                <div key={uniqueKey} ref={items.length === index + 1 ? lastItemRef : null} className="group relative aspect-square bg-stone-100 overflow-hidden rounded-lg shadow-sm border border-stone-200">
                  <img src={item.image_url} alt={item.menuName} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03] cursor-pointer" onClick={() => setSelectedPhoto(item)} />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pointer-events-none">
                    <p className="text-white text-xs font-bold truncate">{item.menuName}</p>
                    <Link href={`/shop/${item.restaurant_id}`} className="text-stone-300 text-[10px] hover:text-white hover:underline transition-all pointer-events-auto flex items-center gap-1 mt-0.5"><MapPin className="w-2.5 h-2.5" />{item.restaurant_name}</Link>
                  </div>
                </div>
              );
              if (activeTab === 'visits' || activeTab === 'bookmarks') return (
                <Link key={uniqueKey} href={`/shop/${item.restaurant_id || item.id}`} ref={items.length === index + 1 ? lastItemRef : null} className="flex items-center gap-4 p-4 bg-white border border-stone-200 rounded-lg hover:border-red-300 hover:shadow-md transition-all group shadow-sm">
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-stone-100"><img src={item.restaurant_image_url || item.thumbnailUrl} alt="" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" /></div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-stone-900 text-lg truncate group-hover:text-red-600 transition-colors">{item.restaurant_name || item.name}</h4>
                    <p className="text-sm text-stone-500 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {item.simple_address || item.address_simple || item.region}</p>
                  </div>
                  {activeTab === 'visits' && <div className="text-right flex-shrink-0 min-w-[100px] flex flex-col items-end justify-center"><div className="flex items-center gap-1 text-red-600 font-bold"><Award className="w-4 h-4" /> <span>{item.visit_count_for_user}회 방문</span></div><p className="text-xs text-stone-400 mt-1">{new Date(item.last_visited_at).toLocaleDateString('ko-KR')}</p></div>}
                </Link>
              );
              if (activeTab === 'posts') return (
                <Link key={uniqueKey} href={`/community/${item.post_id || item.postId || item.id}`} ref={items.length === index + 1 ? lastItemRef : null} className="block p-4 bg-white border border-stone-200 rounded-lg hover:border-red-300 hover:shadow-md transition-all group shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2"><span className="px-2 py-1 bg-red-100 text-red-600 text-[10px] font-black rounded uppercase">{getCategoryLabel(item.category)}</span> {item.storeName && <span className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter">@ {item.storeName}</span>}</div>
                      <h4 className="font-bold text-stone-900 text-lg truncate group-hover:text-red-600 transition-colors">{item.title}</h4>
                      <p className="text-sm text-stone-500 mt-2 line-clamp-1 leading-relaxed">{stripHtml(item.contentPreview)}</p>
                      <div className="flex items-center gap-4 mt-3 text-[10px] font-black uppercase text-stone-400 tracking-widest"><span>{new Date(item.createdAt).toLocaleDateString('ko-KR')}</span><span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {item.likeCount}</span><span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {item.commentCount}</span></div>
                    </div>
                    {item.imageUrl && <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-stone-100 border border-stone-100 shadow-sm"><img src={item.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /></div>}
                  </div>
                </Link>
              );
              if (activeTab === 'comments') return (
                <Link key={uniqueKey} href={`/community/${item.post_id || item.postId}`} ref={items.length === index + 1 ? lastItemRef : null} className="block p-4 bg-white border border-stone-200 rounded-lg hover:border-red-300 hover:shadow-md transition-all group shadow-sm">
                  <p className="text-stone-800 font-medium mb-2 line-clamp-2">"{item.content}"</p>
                  <div className="flex items-center justify-between text-sm text-stone-500"><div className="flex items-center gap-2">{item.postTitle && <span className="truncate max-w-[200px] md:max-w-[400px] text-stone-400 transition-colors group-hover:text-red-600">원본글 보기 <ArrowRight className="w-2.5 h-2.5 ml-1 inline" /></span>}<span>{new Date(item.createdAt).toLocaleDateString('ko-KR')}</span></div>{item.taggedParentAuthorNickname && <span className="text-red-500 font-bold">@ {item.taggedParentAuthorNickname}</span>}</div>
                </Link>
              );
              return null;
            })}
          </div>
        ) : !isLoading && <EmptyState tab={activeTab} message={`아직 항목이 없습니다.`} icon={activeTab === 'photos' ? Camera : activeTab === 'visits' ? MapPin : activeTab === 'bookmarks' ? Heart : activeTab === 'posts' ? FileText : MessageSquare} />}
        {isLoading && pageMeta && pageMeta.number > 0 && <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 text-red-600 animate-spin" /></div>}
      </div>
      {selectedPhoto && <PhotoModal photo={{ id: selectedPhoto.photo_id || selectedPhoto.id, imageUrl: selectedPhoto.image_url, menuName: selectedPhoto.menuName || '이미지 보기', restaurantName: selectedPhoto.restaurant_name || '사용자 프로필', restaurantId: selectedPhoto.restaurant_id, date: selectedPhoto.uploaded_at ? new Date(selectedPhoto.uploaded_at).toLocaleDateString('ko-KR') : '-', comment: selectedPhoto.description || '', isUserPhoto: selectedPhoto.isUserPhoto }} onClose={() => setSelectedPhoto(null)} disableNavigation={false} />}
    </div>
  );
}
