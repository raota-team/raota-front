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

  const getCategoryStyle = (categoryId: string, isSelected: boolean) => {
    const baseStyle = 'px-4 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all flex items-center gap-1.5';
    if (isSelected) {
      switch (categoryId) {
        case 'REVIEW': return `${baseStyle} bg-red-600 border-red-600 text-white shadow-md`;
        case 'TIP': return `${baseStyle} bg-amber-500 border-amber-500 text-white shadow-md`;
        case 'QUESTION': return `${baseStyle} bg-blue-600 border-blue-600 text-white shadow-md`;
        default: return `${baseStyle} bg-stone-900 border-stone-900 text-white shadow-md`;
      }
    }
    return `${baseStyle} bg-white border-stone-200 text-stone-600 hover:bg-stone-50`;
  };

  return (
    <div className="max-w-2xl mx-auto pb-12 px-4 sm:px-0">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center text-stone-500 hover:text-red-500 transition-colors text-sm font-bold uppercase tracking-wider">
          <ArrowLeft className="w-4 h-4 mr-2" /> 취소
        </button>
        <h1 className="text-xl font-black text-stone-900">새 글 작성</h1>
        <div className="w-16"></div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-stone-100">
          <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">카테고리</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button key={cat.id} type="button" onClick={() => setCategory(cat.id)} className={getCategoryStyle(cat.id, category === cat.id)}>
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
                <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${isShopDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isShopDropdownOpen && (
                <div className="absolute left-0 right-0 mt-2 bg-white border border-stone-200 rounded-lg shadow-xl z-20 overflow-hidden flex flex-col max-h-64">
                  <div className="p-2 border-b border-stone-100 bg-stone-50">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                      <input type="text" placeholder="라멘집 검색..." value={shopSearchQuery} onChange={(e) => setShopSearchQuery(e.target.value)} className="w-full pl-8 pr-3 py-1.5 text-xs border border-stone-200 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 bg-white" autoFocus />
                    </div>
                  </div>
                  <div className="overflow-y-auto">
                    <button type="button" onClick={() => { setSelectedShopId(null); setIsShopDropdownOpen(false); }} className={`w-full px-4 py-3 text-left text-sm hover:bg-stone-50 ${!selectedShopId ? 'bg-red-50 text-red-600 font-semibold' : 'text-stone-700'}`}>선택 안함</button>
                    {shops?.filter(shop => !shopSearchQuery || shop.name.toLowerCase().includes(shopSearchQuery.toLowerCase())).map(shop => (
                      <button key={shop.id} type="button" onClick={() => { setSelectedShopId(shop.id); setIsShopDropdownOpen(false); }} className={`w-full px-4 py-3 text-left text-sm hover:bg-stone-50 border-t border-stone-100 ${selectedShopId === shop.id ? 'bg-red-50 text-red-600 font-semibold' : 'text-stone-700'}`}>
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
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목을 입력하세요" className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg font-bold" maxLength={100} />
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
              <img src={imagePreview} alt="Preview" className="max-w-full h-48 object-cover rounded-lg border border-stone-200" />
              <button type="button" onClick={() => { setImagePreview(null); setSelectedFile(null); }} className="absolute -top-2 -right-2 p-1 bg-stone-800 text-white rounded-full hover:bg-stone-900 transition-colors shadow-lg"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-stone-300 rounded-lg cursor-pointer hover:border-red-400 hover:bg-red-50 transition-all mt-2 group">
              <ImageIcon className="w-8 h-8 text-stone-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm text-stone-500">클릭하여 이미지 업로드</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          )}
        </div>

        <div className="p-6 bg-stone-50">
          <button type="submit" disabled={!title.trim() || !content.trim() || isSubmitting} className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center space-x-2 transition-all transform active:scale-[0.98] ${isSubmitting || !title.trim() || !content.trim() ? 'bg-stone-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}>
            {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /><span>작성 중...</span></> : <span>글 작성 완료</span>}
          </button>
        </div>
      </form>
    </div>
  );
}
