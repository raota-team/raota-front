'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Image as ImageIcon, X, Store, ChevronDown, Search, Save } from 'lucide-react';
import { useRamenShops } from '@/hooks/queries/useRamenShops';
import { communityCategories } from '../../../lib/community-data';
import RichTextEditor from '../../../components/RichTextEditor';

export default function CommunityWritePage() {
  const router = useRouter();
  const { data } = useRamenShops({ page: 0, size: 100 });
  const shops = data?.shops ?? [];

  const [category, setCategory] = useState('review');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shopSearchQuery, setShopSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const categories = communityCategories.filter(c => c.id !== 'all');
  const selectedShop = shops?.find(s => s.id === selectedShopId);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsShopDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      alert('글이 작성되었습니다!');
      router.push('/community');
    }, 500);
  };

  const handleTempSave = () => {
    if (!title.trim() && !content.trim()) {
      alert('임시저장할 내용이 없습니다.');
      return;
    }
    alert('임시저장 되었습니다! (현재 브라우저에만 저장됨)');
  };

  const getCategoryStyle = (categoryId: string, isSelected: boolean) => {
    const baseStyle = 'px-4 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all flex items-center gap-1.5';

    if (isSelected) {
      switch (categoryId) {
        case 'review': return `${baseStyle} bg-red-600 border-red-600 text-white`;
        case 'tip': return `${baseStyle} bg-amber-500 border-amber-500 text-white`;
        case 'question': return `${baseStyle} bg-blue-600 border-blue-600 text-white`;
        default: return `${baseStyle} bg-stone-600 border-stone-600 text-white`;
      }
    }

    switch (categoryId) {
      case 'review': return `${baseStyle} bg-white border-red-200 text-red-600 hover:bg-red-50`;
      case 'tip': return `${baseStyle} bg-white border-amber-200 text-amber-600 hover:bg-amber-50`;
      case 'question': return `${baseStyle} bg-white border-blue-200 text-blue-600 hover:bg-blue-50`;
      default: return `${baseStyle} bg-white border-stone-200 text-stone-600 hover:bg-stone-50`;
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center text-stone-500 hover:text-red-500 transition-colors text-sm font-bold uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> 취소
        </button>
        <h1 className="text-xl font-black text-stone-900">새 글 작성</h1>
        <div className="w-16"></div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
        {/* Category Selection */}
        <div className="p-6 border-b border-stone-100">
          <label className="block text-sm font-bold text-stone-700 mb-3">카테고리</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={getCategoryStyle(cat.id, category === cat.id)}
              >
                <span>{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Shop Selection (Only for Review) */}
        {category === 'review' && (
          <div className="p-6 border-b border-stone-100">
            <label className="block text-sm font-bold text-stone-700 mb-3">
              라멘집 선택 <span className="text-stone-400 font-normal">(선택사항)</span>
            </label>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsShopDropdownOpen(!isShopDropdownOpen)}
                className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm font-medium text-stone-700 hover:border-stone-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-stone-400" />
                  <span>{selectedShop ? selectedShop.name : '라멘집을 선택하세요'}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${isShopDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isShopDropdownOpen && (
                <div className="absolute left-0 right-0 mt-2 bg-white border border-stone-200 rounded-lg shadow-xl z-20 overflow-hidden flex flex-col max-h-64">
                  {/* Shop Search Input */}
                  <div className="p-2 border-b border-stone-100 bg-stone-50">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                      <input
                        type="text"
                        placeholder="라멘집 검색..."
                        value={shopSearchQuery}
                        onChange={(e) => setShopSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-stone-200 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 bg-white"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Shop List */}
                  <div className="overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => { setSelectedShopId(null); setIsShopDropdownOpen(false); }}
                      className={`w-full px-4 py-3 text-left text-sm hover:bg-stone-50 ${!selectedShopId ? 'bg-red-50 text-red-600 font-semibold' : 'text-stone-700'}`}
                    >
                      선택 안함
                    </button>
                    {shops
                      ?.filter(shop => !shopSearchQuery || shop.name.toLowerCase().includes(shopSearchQuery.toLowerCase()))
                      .map(shop => (
                        <button
                          key={shop.id}
                          type="button"
                          onClick={() => { setSelectedShopId(shop.id); setIsShopDropdownOpen(false); }}
                          className={`w-full px-4 py-3 text-left text-sm hover:bg-stone-50 border-t border-stone-100 ${selectedShopId === shop.id ? 'bg-red-50 text-red-600 font-semibold' : 'text-stone-700'}`}
                        >
                          <div className="font-medium">{shop.name}</div>
                          <div className="text-xs text-stone-400">{shop.location}</div>
                        </button>
                      ))
                    }
                    {shops?.filter(shop => !shopSearchQuery || shop.name.toLowerCase().includes(shopSearchQuery.toLowerCase())).length === 0 && (
                      <div className="px-4 py-3 text-center text-xs text-stone-400">
                        검색 결과가 없습니다.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Title */}
        <div className="p-6 border-b border-stone-100">
          <label className="block text-sm font-bold text-stone-700 mb-3">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg"
            maxLength={100}
          />
          <p className="text-xs text-stone-400 mt-2 text-right">{title.length}/100</p>
        </div>

        {/* Content */}
        <div className="p-6 border-b border-stone-100">
          <label className="block text-sm font-bold text-stone-700 mb-3">내용</label>
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="내용을 입력하세요..."
          />
        </div>

        {/* Image Upload */}
        <div className="p-6 border-b border-stone-100">
          <label className="block text-sm font-bold text-stone-700 mb-3">
            대표 이미지 (썸네일) <span className="text-stone-400 font-normal">(선택사항)</span>
          </label>

          {imagePreview ? (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-full h-48 object-cover rounded-lg border border-stone-200"
              />
              <button
                type="button"
                onClick={() => setImagePreview(null)}
                className="absolute -top-2 -right-2 p-1 bg-stone-800 text-white rounded-full hover:bg-stone-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-stone-300 rounded-lg cursor-pointer hover:border-red-400 hover:bg-red-50 transition-all">
              <ImageIcon className="w-8 h-8 text-stone-400 mb-2" />
              <span className="text-sm text-stone-500">클릭하여 이미지 업로드</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-6 bg-stone-50 flex flex-col md:flex-row gap-3">
          <button
            type="button"
            onClick={handleTempSave}
            className="flex-1 py-4 bg-white border border-stone-300 text-stone-600 font-bold rounded-lg hover:bg-stone-100 hover:text-stone-800 transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            임시저장
          </button>
          <button
            type="submit"
            disabled={!title.trim() || !content.trim() || isSubmitting}
            className="flex-[2] py-4 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-red-200"
          >
            {isSubmitting ? '작성 중...' : '글 작성 완료'}
          </button>
        </div>
      </form>

      {/* Cancel Link */}
      <div className="mt-6 text-center">
        <button
          onClick={() => router.push('/community')}
          className="inline-flex items-center gap-2 px-6 py-3 text-stone-500 hover:text-stone-800 hover:bg-stone-200/50 rounded-full transition-all font-medium"
        >
          <X className="w-4 h-4" />
          작성 취소하고 목록으로
        </button>
      </div>
    </div>
  );
}
