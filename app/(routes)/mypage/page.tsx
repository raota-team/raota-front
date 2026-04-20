'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Camera, MapPin, Heart, Award, FileText, MessageSquare, X } from 'lucide-react';
import PhotoModal from '../../components/PhotoModal';
import { mockUserProfile, mockUserPhotos, mockUserVisits, mockUserBookmarks, mockUserPosts, mockUserComments } from '../../lib/data';

export default function MyPageView() {
  const params = useParams();
  const userId = params?.id as string | undefined;
  const [activeTab, setActiveTab] = useState('photos');
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const profile = mockUserProfile.data;
  const isOwnProfile = !userId || Number(userId) === profile.user_id;

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    nickname: profile.nickname,
    bio: '라멘을 사랑하는 진정한 미식가. 서울의 모든 이에케 라멘을 정복하는 그날까지.',
    profileImage: profile.profile_image_url,
    backgroundImage: null as string | null
  });

  const displayProfile = { ...profile, nickname: isOwnProfile ? editForm.nickname : `유저 ${userId}` };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'profileImage' | 'backgroundImage') => {
    const file = e.target.files?.[0];
    if (file) {
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

  const handleSave = () => {
    setIsEditing(false);
  };

  const EmptyState = ({ message, icon: Icon }: { message: string; icon: React.ComponentType<any> }) => (
    <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-stone-300 rounded-sm bg-stone-50">
      <div className="bg-stone-200 p-4 rounded-full mb-4">
        <Icon className="w-8 h-8 text-stone-400" />
      </div>
      <p className="text-stone-500 font-bold mb-6">{message}</p>
      <Link href="/" className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-sm font-bold text-sm transition-colors">
        맛집 찾아보기
      </Link>
    </div>
  );

  return (
    <div className="">
      {/* Profile Header */}
      <div className="bg-white border border-stone-200 mb-8 shadow-sm rounded-xl overflow-hidden relative group">
        {/* Cover Image */}
        <div className="h-48 md:h-64 bg-stone-800 relative overflow-hidden">
          {editForm.backgroundImage ? (
            <img
              src={editForm.backgroundImage}
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
          {/* Profile Image */}
          <div className="relative group/profile">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white relative">
              <img src={editForm.profileImage} alt="Profile" className="w-full h-full object-cover" />
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
            {!isEditing && (
              <div className="absolute bottom-2 right-2 bg-red-600 text-white p-1.5 rounded-full border-2 border-white shadow-sm">
                <Award className="w-4 h-4" />
              </div>
            )}
          </div>

          {/* Nickname & Bio Section */}
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
                <h2 className="text-2xl font-black text-stone-900 mb-2">{displayProfile.nickname}</h2>
                <p className="text-stone-500 text-sm max-w-md">
                  {editForm.bio}
                </p>
              </>
            )}
          </div>

          {/* Edit Button */}
          <div className="mt-4 md:mt-0">
            {isOwnProfile && (
              isEditing ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-white hover:bg-stone-50 text-stone-500 px-4 py-2 text-sm font-bold rounded-lg border border-stone-200 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSave}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-bold rounded-lg shadow-md transition-colors"
                  >
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

      {/* Tabs */}
      <div className="flex border-b border-stone-200 mb-8 overflow-x-auto">
        {[
          { id: 'photos', label: '내 사진', icon: Camera, count: displayProfile.stats.total_photo_count },
          { id: 'visits', label: '방문', icon: MapPin, count: displayProfile.stats.visited_restaurant_count },
          { id: 'bookmarks', label: '북마크', icon: Heart, count: displayProfile.stats.total_bookmark_count },
          { id: 'posts', label: '내 글', icon: FileText, count: mockUserPosts.data.posts.length },
          { id: 'comments', label: '내 댓글', icon: MessageSquare, count: mockUserComments.data.comments.length }
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

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {/* Photos Tab */}
        {activeTab === 'photos' && (
          <div className="grid grid-cols-3 gap-1 md:gap-4">
            {mockUserPhotos.data.content.length > 0 ? (
              mockUserPhotos.data.content.map(photo => (
                <div
                  key={photo.photo_id}
                  onClick={() => setSelectedPhoto(photo)}
                  className="group relative aspect-square bg-stone-100 cursor-pointer overflow-hidden"
                >
                  <img src={photo.image_url} alt="User Upload" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                    <p className="text-white text-sm font-bold truncate">{photo.menu_name}</p>
                    <div className="flex justify-between items-center mt-1 border-t border-white/20 pt-1">
                      <span className="text-stone-300 text-xs">@ {photo.restaurant_name}</span>
                      <span className="text-stone-400 text-xs">{new Date(photo.uploaded_at).toLocaleDateString('ko-KR')}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3">
                <EmptyState message="아직 업로드한 사진이 없습니다." icon={Camera} />
              </div>
            )}
          </div>
        )}

        {/* Visits Tab */}
        {activeTab === 'visits' && (
          <div className="flex flex-col gap-3">
            {mockUserVisits.data.visits.length > 0 ? (
              mockUserVisits.data.visits.map((visit, idx) => (
                <Link
                  href={`/shop/${visit.restaurant_id}`}
                  key={idx}
                  className="flex items-center gap-4 p-4 bg-white border border-stone-200 rounded-lg hover:border-red-300 hover:shadow-md transition-all group"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-stone-100">
                    <img src={visit.restaurant_image_url} alt={visit.restaurant_name} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-stone-900 text-lg truncate group-hover:text-red-600 transition-colors">{visit.restaurant_name}</h4>
                    <p className="text-sm text-stone-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {visit.address_simple}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 min-w-[100px] flex flex-col items-end justify-center">
                    <div className="flex items-center gap-1 text-red-600 font-bold">
                      <Award className="w-4 h-4" />
                      <span>{visit.visit_count_for_user}회 방문</span>
                    </div>
                    <p className="text-xs text-stone-400 mt-1">
                      {new Date(visit.last_visited_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <EmptyState message="아직 방문한 곳이 없습니다." icon={MapPin} />
            )}
          </div>
        )}

        {/* Bookmarks Tab */}
        {activeTab === 'bookmarks' && (
          <div className="flex flex-col gap-3">
            {mockUserBookmarks.data.bookmarks.length > 0 ? (
              mockUserBookmarks.data.bookmarks.map((bm, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-4 bg-white border border-stone-200 rounded-lg hover:border-red-300 hover:shadow-md transition-all group"
                >
                  <Link href={`/shop/${bm.restaurant_id}`} className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-stone-100">
                      <img src={bm.restaurant_image_url} alt={bm.restaurant_name} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-stone-900 text-lg truncate group-hover:text-red-600 transition-colors">{bm.restaurant_name}</h4>
                      <p className="text-sm text-stone-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {bm.address_simple}
                      </p>
                    </div>
                  </Link>
                  <div className="flex-shrink-0 flex flex-col items-end justify-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`${bm.restaurant_name} 북마크가 해제되었습니다.`);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-stone-100 hover:bg-red-100 text-stone-600 hover:text-red-600 rounded-full text-sm font-medium transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>해제</span>
                    </button>
                    <p className="text-xs text-stone-400">
                      {new Date(bm.bookmarked_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState message="아직 찜한 가게가 없습니다." icon={Heart} />
            )}
          </div>
        )}

        {/* My Posts Tab */}
        {activeTab === 'posts' && (
          <div className="flex flex-col gap-3">
            {mockUserPosts.data.posts.length > 0 ? (
              mockUserPosts.data.posts.map((post, idx) => (
                <Link
                  href={`/community/${post.post_id}`}
                  key={idx}
                  className="block p-4 bg-white border border-stone-200 rounded-lg hover:border-red-300 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded">
                          {post.categoryName}
                        </span>
                        {post.shopName && (
                          <span className="text-xs text-stone-500">
                            @ {post.shopName}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-stone-900 text-lg truncate group-hover:text-red-600 transition-colors">
                        {post.title}
                      </h4>
                      <div className="flex items-center gap-4 mt-2 text-sm text-stone-500">
                        <span>{post.date}</span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" /> {post.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" /> {post.comments}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <EmptyState message="아직 작성한 글이 없습니다." icon={FileText} />
            )}
          </div>
        )}

        {/* My Comments Tab */}
        {activeTab === 'comments' && (
          <div className="flex flex-col gap-3">
            {mockUserComments.data.comments.length > 0 ? (
              mockUserComments.data.comments.map((comment, idx) => (
                <Link
                  href={`/community/${comment.post_id}`}
                  key={idx}
                  className="block p-4 bg-white border border-stone-200 rounded-lg hover:border-red-300 hover:shadow-md transition-all group"
                >
                  <p className="text-stone-800 font-medium mb-2 line-clamp-2">"{comment.content}"</p>
                  <div className="flex items-center justify-between text-sm text-stone-500">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span className="truncate max-w-[200px] md:max-w-[400px]">{comment.postTitle}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span>{comment.date}</span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" /> {comment.likes}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <EmptyState message="아직 작성한 댓글이 없습니다." icon={MessageSquare} />
            )}
          </div>
        )}
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <PhotoModal
          photo={{
            imageUrl: selectedPhoto.image_url,
            menuName: selectedPhoto.menu_name || selectedPhoto.restaurant_name,
            user: displayProfile.nickname,
            date: new Date(selectedPhoto.uploaded_at).toLocaleDateString(),
            comment: selectedPhoto.comment
          }}
          onClose={() => setSelectedPhoto(null)}
          disableUserNavigation={true}
        />
      )}
    </div>
  );
}
