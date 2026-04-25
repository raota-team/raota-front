'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Camera, MapPin, Heart, Award, FileText, MessageSquare, X, Loader2, ArrowRight } from 'lucide-react';
import PhotoModal from '../../components/PhotoModal';
import { useApp } from '../../context/AppContext';
import { 
  getMyProfile, 
  getMyVisits, 
  getMyBookmarks, 
  getMyPosts, 
  getMyPhotos, 
  getMyComments,
  updateUserProfile,
  MyProfileData,
  PageMeta
} from '@/lib/api/user';
import { getUploadTicket, uploadFileToStorage } from '@/lib/api/files';

export default function MyPageView() {
  const params = useParams();
  const userId = params?.id as string | undefined;
  const { isLoggedIn, showToast } = useApp();
  
  const [activeTab, setActiveTab] = useState('photos');
  const [profile, setProfile] = useState<MyProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    nickname: '',
    bio: '',
    profileImage: '',
    backgroundImage: ''
  });
  
  // 실제 파일 객체 저장용
  const [selectedFiles, setSelectedFiles] = useState<{
    profile: File | null;
    background: File | null;
  }>({ profile: null, background: null });

  // 데이터 목록 및 페이징 상태
  const [items, setItems] = useState<any[]>([]);
  const [pageMeta, setPageMeta] = useState<PageMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useCallback((node: HTMLDivElement) => {
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
  const isOwnProfile = !userId;

  // 프로필 정보 로드
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getMyProfile();
        setProfile(res.data);
        setEditForm({
          nickname: res.data.nickname,
          bio: (res.data.userDescription && res.data.userDescription !== res.data.nickname) 
            ? res.data.userDescription 
            : '자기소개가 아직 없습니다.',
          profileImage: res.data.profile_image_url || '/logo.png',
          backgroundImage: res.data.background_image_url || ''
        });
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setIsInitialLoading(false);
      }
    };

    if (isLoggedIn) fetchProfile();
  }, [isLoggedIn]);

  // 탭 변경 시 데이터 로드
  useEffect(() => {
    fetchTabData(0);
  }, [activeTab]);

  const fetchTabData = async (page: number) => {
    setIsLoading(true);
    try {
      let res;
      switch (activeTab) {
        case 'photos': res = await getMyPhotos(page); break;
        case 'visits': res = await getMyVisits(page); break;
        case 'bookmarks': res = await getMyBookmarks(page); break;
        case 'posts': res = await getMyPosts(page); break;
        case 'comments': res = await getMyComments(page); break;
        default: return;
      }
      
      if (res && res.data) {
        // ID가 없는 유령 데이터 필터링
        const validItems = (res.data.items || []).filter((item: any) => {
          if (activeTab === 'photos') return !!item.photo_id;
          if (activeTab === 'visits' || activeTab === 'bookmarks') return !!(item.restaurant_id || item.id);
          if (activeTab === 'posts') return !!(item.post_id || item.id);
          if (activeTab === 'comments') return !!item.commentId;
          return true;
        });

        setItems(prev => page === 0 ? validItems : [...prev, ...validItems]);
        setPageMeta(res.data.page || null);
      }
    } catch (err) {
      console.error(`Failed to fetch ${activeTab}:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    if (pageMeta && pageMeta.hasNext) {
      fetchTabData(pageMeta.number + 1);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      let finalProfileUrl = profile?.profile_image_url;
      let finalBackgroundUrl = profile?.background_image_url;

      // 1. 프로필 이미지 업로드 (3단계)
      if (selectedFiles.profile) {
        const ticket = await getUploadTicket({
          type: 'PROFILE',
          extension: selectedFiles.profile.name.split('.').pop() || 'jpg'
        });
        finalProfileUrl = await uploadFileToStorage(ticket, selectedFiles.profile);
      }

      // 2. 배경 이미지 업로드 (3단계)
      if (selectedFiles.background) {
        const ticket = await getUploadTicket({
          type: 'BACKGROUND',
          extension: selectedFiles.background.name.split('.').pop() || 'jpg'
        });
        finalBackgroundUrl = await uploadFileToStorage(ticket, selectedFiles.background);
      }

      // 3. 최종 프로필 정보 업데이트
      await updateUserProfile({
        nickname: editForm.nickname,
        bio: editForm.bio,
        profile_image_url: finalProfileUrl,
        background_image_url: finalBackgroundUrl
      });
      
      setIsEditing(false);
      // 서버 데이터 재로딩
      const res = await getMyProfile();
      setProfile(res.data);
      setEditForm({
        nickname: res.data.nickname,
        bio: res.data.userDescription || '',
        profileImage: res.data.profile_image_url || '/logo.png',
        backgroundImage: res.data.background_image_url || ''
      });
      setSelectedFiles({ profile: null, background: null });
      showToast('프로필이 성공적으로 저장되었습니다!', 'success');
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      showToast(err.message || '프로필 수정에 실패했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'profileImage' | 'backgroundImage') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('이미지 크기는 5MB 이하여야 합니다.');
        return;
      }
      
      // 파일 객체 저장
      const key = type === 'profileImage' ? 'profile' : 'background';
      setSelectedFiles(prev => ({ ...prev, [key]: file }));

      // 미리보기용 URL 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditForm(prev => ({
          ...prev,
          [type]: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  const EmptyState = ({ message, icon: Icon, tab }: { message: string; icon: React.ComponentType<any>; tab: string }) => {
    const isCommunityTab = tab === 'posts' || tab === 'comments';
    const targetPath = isCommunityTab ? '/community' : '/shops';
    const btnText = isCommunityTab ? '커뮤니티 가기' : '맛집 찾아보기';

    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-stone-300 rounded-xl bg-stone-50/50">
        <div className="bg-white p-5 rounded-full mb-4 shadow-sm border border-stone-100">
          <Icon className="w-10 h-10 text-stone-300" />
        </div>
        <p className="text-stone-500 font-bold mb-6">{message}</p>
        <Link 
          href={targetPath} 
          className="inline-flex items-center gap-2 bg-stone-900 hover:bg-red-600 text-white px-8 py-3 rounded-full font-bold text-sm transition-all shadow-lg"
        >
          {btnText}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  };

  // 닉네임과 자기소개가 중복되는지 체크하는 유틸
  const displayBio = (profile.userDescription && profile.userDescription !== profile.nickname)
    ? profile.userDescription
    : '자기소개가 아직 없습니다.';

  return (
    <div className="">
      {/* Profile Header */}
      <div className="bg-white border border-stone-200 mb-8 shadow-sm rounded-xl overflow-hidden relative group">
        <div className="h-48 md:h-64 bg-stone-800 relative overflow-hidden">
          {(editForm.backgroundImage || profile.background_image_url) ? (
            <img
              src={editForm.backgroundImage || profile.background_image_url}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-stone-800 to-stone-900 relative">
              <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            </div>
          )}

          {isEditing && (
            <label className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer hover:bg-black/50 transition-colors group/cover">
              <div className="bg-white/90 text-stone-800 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg backdrop-blur-sm">
                <Camera className="w-4 h-4" />
                배경 이미지 변경
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, 'backgroundImage')}
              />
            </label>
          )}
        </div>

        <div className="px-6 pb-6 md:px-10 md:pb-10 flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 md:-mt-20 relative z-10">
          <div className="relative group/profile">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white relative">
              <img src={editForm.profileImage || profile.profile_image_url || '/logo.png'} alt="Profile" className="w-full h-full object-cover" />
              {isEditing && (
                <label className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer transition-opacity">
                  <div className="flex flex-col items-center gap-1 text-white">
                    <Camera className="w-6 h-6" />
                    <span className="text-xs font-bold">변경</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, 'profileImage')}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex-1 w-full md:w-auto text-center md:text-left">
            {isEditing ? (
              <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-500 mb-2 md:text-left text-center">닉네임</label>
                    <input
                      type="text"
                      value={editForm.nickname}
                      onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                      className="w-full text-xl font-bold text-stone-900 md:text-left text-center border-b-2 border-stone-300 focus:border-red-600 outline-none py-2 bg-transparent transition-colors"
                      placeholder="닉네임을 입력하세요"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 mb-2 md:text-left text-center">자기소개</label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      className="w-full text-sm text-stone-700 md:text-left text-center border border-stone-200 rounded-lg p-3 focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none resize-none bg-stone-50 transition-all"
                      rows={3}
                      placeholder="자기소개를 입력하세요"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-black text-stone-900 mb-2">{profile.nickname}</h2>
                <p className="text-stone-500 text-sm max-w-md">
                  {displayBio}
                </p>
              </>
            )}
          </div>

          <div className="mt-4 md:mt-0">
            {isOwnProfile && (
              isEditing ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setSelectedFiles({ profile: null, background: null });
                    }}
                    className="bg-white hover:bg-stone-50 text-stone-500 px-4 py-2 text-sm font-bold rounded-lg border border-stone-200 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-bold rounded-lg shadow-md transition-colors flex items-center gap-2"
                  >
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    저장 완료
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2 text-sm font-bold rounded-lg border border-stone-200 transition-colors"
                >
                  프로필 수정
                </button>
              )
            )}
          </div>
        </div>
      </div>

      <div className="flex border-b border-stone-200 mb-8 overflow-x-auto">
        {[
          { id: 'photos', label: '내 사진', icon: Camera, count: profile.stats.total_photo_count },
          { id: 'visits', label: '방문', icon: MapPin, count: profile.stats.visited_restaurant_count },
          { id: 'bookmarks', label: '북마크', icon: Heart, count: profile.stats.total_bookmark_count },
          { id: 'posts', label: '내 글', icon: FileText, count: profile.stats.post_count },
          { id: 'comments', label: '내 댓글', icon: MessageSquare, count: profile.stats.comment_count }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 md:px-6 py-3 text-sm font-bold tracking-wider transition-colors border-b-2 whitespace-nowrap ${activeTab === tab.id
              ? 'border-red-600 text-stone-900'
              : 'border-transparent text-stone-400 hover:text-stone-600'
              }`}
          >
            <div className="flex items-center">
              <tab.icon className="w-4 h-4 mr-1.5" />
              {tab.label}
              <span className={`ml-1 ${activeTab === tab.id ? 'text-red-600' : 'text-stone-400'}`}>({tab.count})</span>
            </div>
          </button>
        ))}
      </div>

      <div className="min-h-[400px] pb-20 relative">
        {isLoading && (!pageMeta || pageMeta.number === 0) && (
          <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[1px] flex justify-center pt-20">
            <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
          </div>
        )}

        {items.length > 0 ? (
          <div className={activeTab === 'photos' ? "grid grid-cols-3 gap-1 md:gap-4" : "flex flex-col gap-3"}>
            {items.map((item, index) => {
              const isLastElement = items.length === index + 1;
              const itemProps = isLastElement ? { ref: lastItemRef } : {};
              const itemId = item.photo_id || item.restaurant_id || item.post_id || item.id || 'no-id';
              const uniqueKey = `${activeTab}-${itemId}-${index}`;

              if (activeTab === 'photos') {
                return (
                  <div key={uniqueKey} {...itemProps} className="group relative aspect-square bg-stone-100 overflow-hidden rounded-lg shadow-sm border border-stone-200">
                    <img src={item.image_url} alt={item.menuName} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03] cursor-pointer" onClick={() => setSelectedPhoto(item)} />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pointer-events-none">
                      <p className="text-white text-xs font-bold truncate">{item.menuName}</p>
                      <Link href={`/shop/${item.restaurant_id}`} className="text-stone-300 text-[10px] hover:text-white hover:underline transition-all pointer-events-auto flex items-center gap-1 mt-0.5"><MapPin className="w-2.5 h-2.5" />{item.restaurant_name}</Link>
                    </div>
                  </div>
                );
              }

              if (activeTab === 'visits') {
                const shopId = item.restaurant_id || item.id;
                return (
                  <Link href={`/shop/${shopId}`} key={uniqueKey} {...(itemProps as any)} className="flex items-center gap-4 p-4 bg-white border border-stone-200 rounded-lg hover:border-red-300 hover:shadow-md transition-all group">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-stone-100">
                      <img src={item.restaurant_image_url} alt={item.restaurant_name} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-stone-900 text-lg truncate group-hover:text-red-600 transition-colors">{item.restaurant_name}</h4>
                      <p className="text-sm text-stone-500 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {item.simple_address}</p>
                    </div>
                    <div className="text-right flex-shrink-0 min-w-[100px] flex flex-col items-end justify-center">
                      <div className="flex items-center gap-1 text-red-600 font-bold"><Award className="w-4 h-4" /> <span>{item.visit_count_for_user}회 방문</span></div>
                      <p className="text-xs text-stone-400 mt-1">{item.last_visited_at ? new Date(item.last_visited_at).toLocaleDateString('ko-KR') : '-'}</p>
                    </div>
                  </Link>
                );
              }

              if (activeTab === 'bookmarks') {
                const shopId = item.restaurant_id || item.id;
                return (
                  <div key={uniqueKey} {...itemProps} className="flex items-center gap-4 p-4 bg-white border border-stone-200 rounded-lg hover:border-red-300 hover:shadow-md transition-all group">
                    <Link href={`/shop/${shopId}`} className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-stone-100">
                        <img src={item.restaurant_image_url} alt={item.restaurant_name} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-stone-900 text-lg truncate group-hover:text-red-600 transition-colors">{item.restaurant_name}</h4>
                        <p className="text-sm text-stone-500 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {item.address_simple}</p>
                      </div>
                    </Link>
                    <div className="flex-shrink-0 flex flex-col items-end justify-center gap-1">
                      <p className="text-xs text-stone-400">{item.bookmarked_at ? new Date(item.bookmarked_at).toLocaleDateString('ko-KR') : '-'}</p>
                    </div>
                  </div>
                );
              }

              if (activeTab === 'posts') {
                return (
                  <Link href={`/community/${item.post_id || item.id}`} key={uniqueKey} {...(itemProps as any)} className="block p-4 bg-white border border-stone-200 rounded-lg hover:border-red-300 hover:shadow-md transition-all group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2"><span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded">{item.category}</span> {item.storeName && <span className="text-xs text-stone-500">@ {item.storeName}</span>}</div>
                        <h4 className="font-bold text-stone-900 text-lg truncate group-hover:text-red-600 transition-colors">{item.title}</h4>
                        <p className="text-sm text-stone-500 mt-2 line-clamp-1">{item.contentPreview}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-stone-500">
                          <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('ko-KR') : '-'}</span>
                          <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> {item.likeCount}</span>
                          <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4" /> {item.commentCount}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              }

              if (activeTab === 'comments') {
                return (
                  <Link href={`/community/${item.post_id || item.postId}`} key={uniqueKey} {...(itemProps as any)} className="block p-4 bg-white border border-stone-200 rounded-lg hover:border-red-300 hover:shadow-md transition-all group">
                    <p className="text-stone-800 font-medium mb-2 line-clamp-2">"{item.content}"</p>
                    <div className="flex items-center justify-between text-sm text-stone-500">
                      <div className="flex items-center gap-2">
                        {item.postTitle && <span className="truncate max-w-[200px] md:max-w-[400px] text-stone-400">원본글: {item.postTitle}</span>}
                        <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('ko-KR') : '-'}</span>
                      </div>
                      {item.taggedParentAuthorNickname && <span className="text-red-500 font-bold">@ {item.taggedParentAuthorNickname}</span>}
                    </div>
                  </Link>
                );
              }
              return null;
            })}
          </div>
        ) : !isLoading && (
          <EmptyState tab={activeTab} message={`아직 ${activeTab === 'photos' ? '업로드한 사진이' : activeTab === 'visits' ? '방문한 곳이' : activeTab === 'bookmarks' ? '찜한 가게가' : activeTab === 'posts' ? '작성한 글이' : '작성한 댓글이'} 없습니다.`} icon={activeTab === 'photos' ? Camera : activeTab === 'visits' ? MapPin : activeTab === 'bookmarks' ? Heart : activeTab === 'posts' ? FileText : MessageSquare} />
        )}

        {isLoading && pageMeta && pageMeta.number > 0 && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
          </div>
        )}
      </div>

      {selectedPhoto && (
        <PhotoModal 
          photo={{ 
            id: selectedPhoto.id,
            imageUrl: selectedPhoto.image_url, 
            menuName: selectedPhoto.menuName || selectedPhoto.restaurant_name, 
            restaurantName: selectedPhoto.restaurant_name, 
            restaurantId: selectedPhoto.restaurant_id, 
            date: selectedPhoto.uploaded_at ? new Date(selectedPhoto.uploaded_at).toLocaleDateString('ko-KR') : '-', 
            comment: selectedPhoto.description || '' 
          }} 
          onClose={() => setSelectedPhoto(null)} 
          disableNavigation={false} 
        />
      )}
    </div>
  );
}
