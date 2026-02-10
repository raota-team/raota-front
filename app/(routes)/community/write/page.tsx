'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function CommunityWritePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('review');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 실제로는 여기서 API 호출
    alert('게시글이 작성되었습니다!');
    router.push('/community');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button 
        onClick={() => router.back()} 
        className="mb-6 flex items-center text-stone-500 hover:text-red-500 transition-colors text-sm font-bold"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> 돌아가기
      </button>

      <div className="glass rounded-2xl p-8">
        <h1 className="text-3xl font-black text-stone-900 mb-6">글쓰기</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">카테고리</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none bg-white/70"
            >
              <option value="review">맛집후기</option>
              <option value="tip">꿀팁</option>
              <option value="qna">Q&A</option>
              <option value="free">자유게시판</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none bg-white/70"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">내용</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력하세요"
              rows={15}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none bg-white/70 resize-none"
              required
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold rounded-lg transition-all"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-lg transition-all"
            >
              작성하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
