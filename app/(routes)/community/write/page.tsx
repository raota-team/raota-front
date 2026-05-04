'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Image as ImageIcon, X, Store, ChevronDown, Search, Save, Loader2 } from 'lucide-react';
import { useRamenShops } from '@/hooks/queries/useRamenShops';
import RichTextEditor from '../../../components/RichTextEditor';
import { useApp } from '@/app/context/AppContext';
import { useQueryClient } from '@tanstack/react-query';
import { getUploadTicket, uploadFileToStorage } from '@/lib/api/files';
import { createCommunityPost } from '@/lib/api/community';
import { compressImage } from '@/lib/utils/image-optimization';

const categories = [
  { id: 'REVIEW', name: '맛집후기', icon: '🍜' },
  { id: 'TIP', name: '라멘꿀팁', icon: '💡' },
  { id: 'QUESTION', name: 'Q&A', icon: '❓' },
  { id: 'FREE', name: '자유게시판', icon: '✨' },
];

export default function CommunityWritePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useApp();
  const { data } = useRamenShops({ page: 0, size: 100, sort: ["name,asc"] });
  const shops = data?.shops ?? [];

  const [category, setCategory] = useState('REVIEW');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shopSearchQuery, setShopSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedShop = shops?.find(s => s.id === selectedShopId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsShopDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /** 에디터 내부 이미지 업로드 핸들러 */
  const handleEditorImageUpload = async (file: File): Promise<string> => {
    // 1. 압축
    const compressedFile = await compressImage(file);
    // 2. 티켓 발급
    const ticket = await getUploadTicket({
      type: 'COMMUNITY',
      extension: 'webp'
    });
    // 3. 업로드 및 URL 반환
    return await uploadFileToStorage(ticket, compressedFile);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showToast('이미지 크기는 10MB 이하여야 합니다.', 'error');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast('제목과 내용을 입력해주세요.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      let thumbnailUrl = '';

      // 1. 대표 이미지가 있다면 압축 후 업로드 수행
      if (selectedFile) {
        const compressedFile = await compressImage(selectedFile);
        const ticket = await getUploadTicket({
          type: 'COMMUNITY',
          extension: 'webp'
        });
        thumbnailUrl = await uploadFileToStorage(ticket, compressedFile);
      }

      // 2. 최종 게시글 작성 API 호출
      await createCommunityPost({
        category,
        ramenShopId: category === 'REVIEW' ? selectedShopId : null,
        title: title.trim(),
        content,
        thumbnailUrl,
        contentFormat: 'TIPTAP_JSON'
      });

      showToast('글이 성공적으로 작성되었습니다!', 'success');
      
      // 목록 쿼리 무효화 (커뮤니티 메인 목록 업데이트 강제)
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      
      router.push('/community');
    } catch (error: any) {
      console.error('Failed to create post:', error);
      showToast(error.message || '글 작성 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryStyle = (_categoryId: string, isSelected: boolean) => {
    const baseStyle = 'px-4 py-3 rounded-sm border text-sm font-bold transition-colors flex items-center';
    if (isSelected) {
      return `${baseStyle} bg-[#e60000] border-[#e60000] text-white`;
    }
    return `${baseStyle} bg-white border-stone-200 text-[#25282b] hover:border-[#e60000]`;
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pb-12 sm:px-0">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center text-sm font-bold uppercase tracking-wider text-[#7e7e7e] transition-colors hover:text-[#e60000]">
          <ArrowLeft className="w-4 h-4 mr-2" /> 취소
        </button>
        <h1 className="text-3xl font-black text-[#25282b]">새 글 작성</h1>
        <div className="w-16"></div>
      </div>

      <form onSubmit={handleSubmit} className="overflow-hidden rounded-sm border border-stone-200 bg-white">
        <div className="p-6 border-b border-stone-100">
          <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">카테고리</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button key={cat.id} type="button" onClick={() => setCategory(cat.id)} className={getCategoryStyle(cat.id, category === cat.id)}>
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
                  <Store className="w-4 h-4 text-[#e60000]" />
                  <span>{selectedShop ? selectedShop.name : '라멘집을 선택하세요'}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${isShopDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isShopDropdownOpen && (
                <div className="absolute left-0 right-0 z-20 mt-2 flex max-h-64 flex-col overflow-hidden rounded-sm border border-stone-200 bg-white">
                  <div className="p-2 border-b border-stone-100 bg-stone-50">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                      <input type="text" placeholder="라멘집 검색..." value={shopSearchQuery} onChange={(e) => setShopSearchQuery(e.target.value)} className="w-full rounded-sm border border-stone-200 bg-white py-2 pl-8 pr-3 text-xs focus:border-[#e60000] focus:outline-none" autoFocus />
                    </div>
                  </div>
                  <div className="overflow-y-auto">
                    <button type="button" onClick={() => { setSelectedShopId(null); setIsShopDropdownOpen(false); }} className={`w-full px-4 py-3 text-left text-sm hover:bg-stone-50 ${!selectedShopId ? 'text-[#e60000] font-semibold' : 'text-stone-700'}`}>선택 안함</button>
                    {shops?.filter(shop => !shopSearchQuery || shop.name.toLowerCase().includes(shopSearchQuery.toLowerCase())).map(shop => (
                      <button key={shop.id} type="button" onClick={() => { setSelectedShopId(shop.id); setIsShopDropdownOpen(false); }} className={`w-full border-t border-stone-100 px-4 py-3 text-left text-sm hover:bg-stone-50 ${selectedShopId === shop.id ? 'font-semibold text-[#e60000]' : 'text-stone-700'}`}>
                        <div className="font-medium">{shop.name}</div>
                        <div className="text-xs text-stone-400">{shop.location}</div>
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
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목을 입력하세요" className="w-full rounded-sm border border-stone-200 px-4 py-3 text-lg font-bold text-[#25282b] focus:border-[#e60000] focus:outline-none" maxLength={100} />
        </div>

        <div className="p-6 border-b border-stone-100">
          <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">내용</label>
          <RichTextEditor 
            content={content} 
            onChange={setContent} 
            placeholder="라멘에 대한 이야기를 들려주세요..." 
            onImageUpload={handleEditorImageUpload}
          />
        </div>

        <div className="p-6 border-b border-stone-100">
          <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">대표 이미지 (선택)</label>
          {imagePreview ? (
            <div className="relative inline-block mt-2">
              <img src={imagePreview} alt="Preview" className="h-48 max-w-full rounded-md border border-stone-200 object-cover" />
              <button type="button" onClick={() => { setImagePreview(null); setSelectedFile(null); }} className="absolute -right-2 -top-2 rounded-full bg-[#25282b] p-1 text-white transition-opacity hover:opacity-90"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <label className="group mt-2 flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-sm border border-dashed border-stone-300 transition-colors hover:border-[#e60000]">
              <ImageIcon className="mb-2 h-8 w-8 text-stone-400 transition-colors group-hover:text-[#e60000]" />
              <span className="text-sm text-stone-500">클릭하여 이미지 업로드</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          )}
        </div>

        <div className="bg-stone-50 p-6">
          <button type="submit" disabled={!title.trim() || !content.trim() || isSubmitting} className={`flex w-full items-center justify-center space-x-2 rounded-sm py-4 font-bold text-white transition-opacity active:opacity-90 ${isSubmitting || !title.trim() || !content.trim() ? 'cursor-not-allowed bg-stone-300' : 'bg-[#e60000] hover:opacity-90'}`}>
            {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /><span>작성 중...</span></> : <span>글 작성 완료</span>}
          </button>
        </div>
      </form>
    </div>
  );
}
