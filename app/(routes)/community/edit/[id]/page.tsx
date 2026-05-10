'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Image as ImageIcon, X, Store, ChevronDown, Search, Save, Loader2 } from 'lucide-react';
import { useRamenShops } from '@/hooks/queries/useRamenShops';
import RichTextEditor from '@/app/components/RichTextEditor';
import { useApp } from '@/app/context/AppContext';
import { getUploadTicket, uploadFileToStorage } from '@/lib/api/files';
import { updateCommunityPost, getCommunityPostDetail } from '@/lib/api/community';
import { compressImage } from '@/lib/utils/image-optimization';
import Loading from '@/app/loading';

const categories = [
  { id: 'REVIEW', name: '맛집후기', icon: '🍜' },
  { id: 'TIP', name: '라멘꿀팁', icon: '💡' },
  { id: 'QUESTION', name: 'Q&A', icon: '❓' },
  { id: 'FREE', name: '자유게시판', icon: '✨' },
];

export default function CommunityEditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { showToast, currentUser } = useApp();
  const postId = Number(resolvedParams.id);
  
  const { data: shopData } = useRamenShops({ page: 0, size: 100, sort: "NAME" });
  const shops = shopData?.shops ?? [];

  const [category, setCategory] = useState('REVIEW');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [shopSearchQuery, setShopSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await getCommunityPostDetail(postId);
        const post = res.data;
        
        // 작성자 본인 확인 로직 강화
        const currentId = currentUser?.user_id || currentUser?.id;
        const authorId = post.authorId || post.writerId;
        const myNickname = currentUser?.nickname?.replace(/\s/g, '');
        const targetNickname = post.authorName?.replace(/\s/g, '');

        const isMine = (currentId && authorId && String(currentId) === String(authorId)) || 
                      (myNickname && targetNickname && myNickname === targetNickname);

        if (!isMine) {
          showToast('수정 권한이 없습니다.', 'error');
          router.push('/community');
          return;
        }

        setTitle(post.title);
        setContent(post.content);
        setCategory(post.category);
        setExistingImageUrl(post.imageUrl);
        setImagePreview(post.imageUrl);
        
        // 라멘집 ID 매칭 (가게 이름으로 찾거나 API 스펙에 따라 보정 필요)
        // 여기서는 명세에 따라 ramenShopId가 상세 조회에 포함되어 있다고 가정하거나 
        // 이름으로 매칭하는 로직을 임시로 넣습니다.
        if (post.storeName) {
           const shop = shops.find(s => s.name === post.storeName);
           if (shop) setSelectedShopId(shop.id);
        }
      } catch (err) {
        showToast('게시글을 불러오지 못했습니다.', 'error');
        router.push('/community');
      } finally {
        setIsLoading(false);
      }
    };

    if (shops.length > 0) fetchPost();
  }, [postId, shops, currentUser]);

  const handleEditorImageUpload = async (file: File): Promise<string> => {
    const compressedFile = await compressImage(file);
    const ticket = await getUploadTicket({ type: 'COMMUNITY', extension: 'webp' });
    return await uploadFileToStorage(ticket, compressedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast('제목과 내용을 입력해주세요.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      let thumbnailUrl = existingImageUrl || '';

      if (selectedFile) {
        const compressedFile = await compressImage(selectedFile);
        const ticket = await getUploadTicket({ type: 'COMMUNITY', extension: 'webp' });
        thumbnailUrl = await uploadFileToStorage(ticket, compressedFile);
      }

      await updateCommunityPost(postId, {
        category,
        ramenShopId: category === 'REVIEW' ? selectedShopId : null,
        title: title.trim(),
        content,
        thumbnailUrl,
        contentFormat: 'TIPTAP_JSON'
      });

      showToast('글이 성공적으로 수정되었습니다!', 'success');
      router.push(`/community/${postId}`);
    } catch (error: any) {
      showToast(error.message || '수정 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Loading />;

  const selectedShop = shops?.find(s => s.id === selectedShopId);

  return (
    <div className="max-w-2xl mx-auto pb-12 px-4 sm:px-0">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center text-stone-500 hover:text-red-500 transition-colors text-sm font-bold uppercase tracking-wider">
          <ArrowLeft className="w-4 h-4 mr-2" /> 취소
        </button>
        <h1 className="text-xl font-black text-stone-900">글 수정하기</h1>
        <div className="w-16"></div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-stone-100">
          <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">카테고리</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button 
                key={cat.id} 
                type="button" 
                onClick={() => setCategory(cat.id)} 
                className={`px-4 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all flex items-center gap-1.5 ${category === cat.id ? 'bg-stone-900 border-stone-900 text-white' : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'}`}
              >
                <span>{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {category === 'REVIEW' && (
          <div className="p-6 border-b border-stone-100">
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">라멘집 선택</label>
            <div className="relative" ref={dropdownRef}>
              <button type="button" onClick={() => setIsShopDropdownOpen(!isShopDropdownOpen)} className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm font-medium text-stone-700 hover:border-stone-300 transition-colors">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-stone-400" />
                  <span>{selectedShop ? selectedShop.name : '라멘집을 선택하세요'}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-stone-400" />
              </button>
              {isShopDropdownOpen && (
                <div className="absolute left-0 right-0 mt-2 bg-white border border-stone-200 rounded-lg shadow-xl z-20 overflow-hidden flex flex-col max-h-64">
                   <div className="p-2 border-b border-stone-100 bg-stone-50">
                    <input type="text" placeholder="라멘집 검색..." value={shopSearchQuery} onChange={(e) => setShopSearchQuery(e.target.value)} className="w-full px-3 py-1.5 text-xs border border-stone-200 rounded-md outline-none" autoFocus />
                  </div>
                  <div className="overflow-y-auto">
                    {shops?.filter(shop => !shopSearchQuery || shop.name.includes(shopSearchQuery)).map(shop => (
                      <button key={shop.id} type="button" onClick={() => { setSelectedShopId(shop.id); setIsShopDropdownOpen(false); }} className="w-full px-4 py-3 text-left text-sm hover:bg-stone-50 border-t border-stone-100">
                        <div className="font-medium">{shop.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="p-6 border-b border-stone-100">
          <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">제목</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목을 입력하세요" className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-lg font-bold" />
        </div>

        <div className="p-6 border-b border-stone-100">
          <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">내용</label>
          <RichTextEditor content={content} onChange={setContent} onImageUpload={handleEditorImageUpload} />
        </div>

        <div className="p-6 bg-stone-50">
          <button type="submit" disabled={isSubmitting} className="w-full py-4 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50">
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>수정 완료</span>}
          </button>
        </div>
      </form>
    </div>
  );
}
