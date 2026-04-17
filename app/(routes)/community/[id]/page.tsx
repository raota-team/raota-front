'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Heart, Share2, MessageCircle, Send, Store } from 'lucide-react';
import { mockCommunityPosts, mockComments, Comment, CommunityPost } from '../../../lib/community-data';

export default function CommunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const post = mockCommunityPosts.find((p) => p.id === parseInt(params.id as string));
  const comments = mockComments[parseInt(params.id as string)] || [];

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post?.likes || 0);
  const [newComment, setNewComment] = useState('');
  const [localComments, setLocalComments] = useState<Comment[]>(comments);

  if (!post) {
    return (
      <div className="text-center py-16">
        <p className="text-stone-500">게시글을 찾을 수 없습니다.</p>
        <Link href="/community" className="text-red-600 hover:underline mt-4 inline-block">
          커뮤니티로 돌아가기
        </Link>
      </div>
    );
  }

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount((prev) => isLiked ? prev - 1 : prev + 1);
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now(),
      author: '나',
      avatar: '😊',
      content: newComment,
      date: new Date().toLocaleDateString('ko-KR').replace(/\. /g, '.').replace('.', ''),
      likes: 0,
    };
    setLocalComments([...localComments, comment]);
    setNewComment('');
  };

  const handleShare = async () => {
    const shareData = {
      title: `${post.title} - RAOTA 커뮤니티`,
      text: '라멘 매니아들의 커뮤니티, RAOTA에서 확인해보세요!',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('링크가 클립보드에 복사되었습니다!');
      } catch (err) {
        console.error('Failed to copy link:', err);
        alert('링크 복사에 실패했습니다.');
      }
    }
  };

  const getCategoryStyle = (categoryId: string) => {
    switch (categoryId) {
      case 'review': return 'bg-red-50 text-red-600 border-red-200';
      case 'tip': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'question': return 'bg-blue-50 text-blue-600 border-blue-200';
      default: return 'bg-stone-100 text-stone-600 border-stone-200';
    }
  };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center text-stone-500 hover:text-red-500 transition-colors text-sm font-bold uppercase tracking-wider"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> 목록으로
      </button>

      {/* Post Card */}
      <article className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-stone-100">
          {/* Category & Shop */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getCategoryStyle(post.category)}`}>
              {post.categoryName}
            </span>
            {post.shopName && (
              <Link
                href={`/shop/${post.shopId}`}
                className="flex items-center gap-1 text-xs text-stone-500 bg-stone-100 px-3 py-1 rounded-full hover:bg-stone-200 transition-colors"
              >
                <Store className="w-3 h-3" />
                {post.shopName}
              </Link>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-black text-stone-900 mb-4 leading-tight">
            {post.title}
          </h1>

          {/* Author Info */}
          <div className="flex items-center justify-between">
            <Link href={`/user/${post.authorId}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
              <span className="text-2xl">{post.authorAvatar}</span>
              <div>
                <div className="font-semibold text-stone-900 group-hover:text-red-600 group-hover:underline">{post.author}</div>
                <div className="text-xs text-stone-400">{post.date}</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Image */}
        {post.imageUrl && (
          <div className="border-b border-stone-100">
            <img
              src={post.imageUrl}
              alt=""
              className="w-full h-auto max-h-96 object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          <div
            className="prose prose-stone max-w-none prose-img:rounded-lg prose-headings:font-bold prose-a:text-red-600"
            dangerouslySetInnerHTML={{ __html: post.content || '' }}
          />
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${isLiked
                  ? 'bg-red-100 text-red-600'
                  : 'bg-white border border-stone-200 text-stone-600 hover:border-red-300 hover:text-red-500'
                }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="font-semibold">{likeCount}</span>
            </button>
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-stone-200 text-stone-600 hover:border-stone-300 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">공유</span>
            </button>
          </div>
          <div className="flex items-center gap-2 text-stone-400 text-sm">
            <MessageCircle className="w-4 h-4" />
            <span>댓글 {localComments.length}</span>
          </div>
        </div>
      </article>

      {/* Comments Section */}
      <div className="mt-6 bg-white border border-stone-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-stone-100 bg-stone-50">
          <h3 className="font-bold text-stone-900 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-red-500" />
            댓글 {localComments.length}개
          </h3>
        </div>

        {/* Comment List */}
        <div className="divide-y divide-stone-100">
          {localComments.length === 0 ? (
            <div className="p-8 text-center text-stone-400">
              <p>아직 댓글이 없습니다.</p>
              <p className="text-sm mt-1">첫 댓글을 작성해보세요!</p>
            </div>
          ) : (
            localComments.map((comment) => (
              <div key={comment.id} className="p-4">
                <div className="flex gap-3">
                  <span className="text-xl flex-shrink-0">{comment.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link href={`/user/${comment.authorId}`} className="font-semibold text-stone-900 text-sm hover:text-red-600 hover:underline">
                        {comment.author}
                      </Link>
                      <span className="text-xs text-stone-400">{comment.date}</span>
                    </div>
                    <p className="text-stone-700 text-sm">{comment.content}</p>
                    <button className="flex items-center gap-1 mt-2 text-xs text-stone-400 hover:text-red-500 transition-colors">
                      <Heart className="w-3 h-3" />
                      <span>{comment.likes}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment Input */}
        <form onSubmit={handleSubmitComment} className="p-4 border-t border-stone-100 bg-stone-50">
          <div className="flex gap-3">
            <span className="text-xl">😊</span>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                placeholder="댓글을 작성하세요..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 px-4 py-2 border border-stone-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Back to List */}
      <div className="mt-8 text-center">
        <Link
          href="/community"
          className="inline-flex items-center gap-2 px-6 py-3 border-2 border-red-500 text-red-600 font-bold rounded-lg hover:bg-red-600 hover:text-white transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          목록으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
