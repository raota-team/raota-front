'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Image as ImageIcon, X, Store, ChevronDown, Loader2 } from 'lucide-react';
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('이미지 크기는 10MB 이하여야 합니다.', 'error');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
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
        <button onClick={() => router.back()} className="flex items-center text-sm font-bold uppercase tracking-wider text-[#7e7e7e] transition-colors hover:text-[#e60000]">
          <ArrowLeft className="w-4 h-4 mr-2" /> 취소
        </button>
        <h1 className="text-xl font-black text-[#25282b]">글 수정하기</h1>
        <div className="w-16"></div>
      </div>

      <form onSubmit={handleSubmit} className="overflow-hidden rounded-sm border border-stone-200 bg-white">
        <div className="p-6 border-b border-stone-100">
          <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">카테고리</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button 
                key={cat.id} 
                type="button" 
                onClick={() => setCategory(cat.id)} 
                className={`flex items-center gap-1.5 rounded-sm border px-4 py-2.5 text-sm font-bold transition-colors ${category === cat.id ? 'border-[#e60000] bg-[#e60000] text-white' : 'border-stone-200 bg-white text-stone-600 hover:border-[#e60000]'}`}
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
              <button type="button" onClick={() => setIsShopDropdownOpen(!isShopDropdownOpen)} className="flex w-full items-center justify-between gap-2 rounded-sm border border-stone-200 bg-white px-4 py-3 text-sm font-bold text-[#25282b] transition-colors hover:border-[#e60000]">
                <div className="flex items-center gap-2">
                  <Store className={`w-4 h-4 ${selectedShop ? 'text-[#e60000]' : 'text-stone-400'}`} />
                  <span>{selectedShop ? selectedShop.name : '라멘집을 선택하세요'}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-stone-400" />
              </button>
              {isShopDropdownOpen && (
                <div className="absolute left-0 right-0 z-20 mt-2 flex max-h-64 flex-col overflow-hidden rounded-sm border border-stone-200 bg-white">
                   <div className="p-2 border-b border-stone-100 bg-stone-50">
                    <input type="text" placeholder="라멘집 검색..." value={shopSearchQuery} onChange={(e) => setShopSearchQuery(e.target.value)} className="w-full rounded-sm border border-stone-200 px-3 py-1.5 text-xs outline-none focus:border-[#e60000]" autoFocus />
                  </div>
                  <div className="overflow-y-auto">
                    {shops?.filter(shop => !shopSearchQuery || shop.name.includes(shopSearchQuery)).map(shop => (
                      <button key={shop.id} type="button" onClick={() => { setSelectedShopId(shop.id); setIsShopDropdownOpen(false); }} className={`w-full border-t border-stone-100 px-4 py-3 text-left text-sm hover:bg-stone-50 ${selectedShopId === shop.id ? 'font-bold text-[#e60000]' : 'text-stone-700'}`}>
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
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목을 입력하세요" className="w-full rounded-sm border border-stone-200 px-4 py-3 text-lg font-bold text-[#25282b] outline-none focus:border-[#e60000]" />
        </div>

        <div className="p-6 border-b border-stone-100">
          <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">내용</label>
          <RichTextEditor content={content} onChange={setContent} onImageUpload={handleEditorImageUpload} />
        </div>

        <div className="p-6 border-b border-stone-100">
          <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">대표 이미지 (선택)</label>
          {imagePreview ? (
            <div className="relative inline-block mt-2">
              <img src={imagePreview} alt="Preview" className="h-48 max-w-full rounded-md border border-stone-200 object-cover" />
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null);
                  setSelectedFile(null);
                  setExistingImageUrl(null);
                }}
                className="absolute -right-2 -top-2 rounded-full bg-[#25282b] p-1 text-white transition-opacity hover:opacity-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="group mt-2 flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-sm border border-dashed border-stone-300 transition-colors hover:border-[#e60000]">
              <ImageIcon className="mb-2 h-8 w-8 text-stone-400 transition-colors group-hover:text-[#e60000]" />
              <span className="text-sm text-stone-500">클릭하여 이미지 업로드</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          )}
        </div>

        <div className="p-6 bg-stone-50">
          <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center space-x-2 rounded-sm bg-[#e60000] py-4 font-bold text-white transition-opacity hover:opacity-90 active:opacity-90 disabled:opacity-50">
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>수정 완료</span>}
          </button>
        </div>
      </form>
    </div>
  );
}
