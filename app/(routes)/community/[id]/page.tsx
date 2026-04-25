'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Heart, Share2, MessageCircle, Send, Store, Loader2, Trash2 } from 'lucide-react';
import { getCommunityPostDetail, getComments, createComment, deleteComment, CommunityPostDetail, CommunityComment } from '@/lib/api/community';
import { useApp } from '@/app/context/AppContext';
import Loading from '@/app/loading';

export default function CommunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { showToast, showConfirm, isLoggedIn } = useApp();
  const postId = Number(resolvedParams.id);

  const [post, setPost] = useState<CommunityPostDetail | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPostData = useCallback(async () => {
    if (isNaN(postId)) return;
    
    setIsLoading(true);
    try {
      // 1. 게시글 상세 정보 먼저 로드 (필수)
      const postRes = await getCommunityPostDetail(postId);
      setPost(postRes.data);
      
      // 2. 댓글 목록 로드 (선택적 - 실패해도 게시글은 보여줌)
      try {
        const commentsRes = await getComments(postId);
        setComments(commentsRes.data.items || []);
      } catch (commentErr) {
        console.warn('Failed to fetch comments, but post was loaded:', commentErr);
        // 댓글 로딩 실패 시 빈 목록으로 유지
      }
    } catch (err) {
      console.error('Failed to fetch post details:', err);
      showToast('게시글을 불러오지 못했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [postId, showToast]);

  useEffect(() => {
    fetchPostData();
  }, [fetchPostData]);

  const handleLike = () => {
    showToast('좋아요 기능은 곧 지원될 예정입니다.', 'info');
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      showConfirm('로그인이 필요한 기능입니다. 로그인하시겠습니까?', () => router.push('/login'));
      return;
    }
    if (!newComment.trim() || isSubmitting || isNaN(postId)) return;

    setIsSubmitting(true);
    try {
      await createComment(postId, { content: newComment.trim() });
      setNewComment('');
      showToast('댓글이 작성되었습니다!', 'success');
      // 댓글 목록만 다시 불러오기
      const res = await getComments(postId);
      setComments(res.data.items || []);
    } catch (err: any) {
      showToast(err.message || '댓글 작성에 실패했습니다.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = async () => {
    if (!post) return;
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
      try {
        await navigator.clipboard.writeText(window.location.href);
        showToast('링크가 클립보드에 복사되었습니다!', 'success');
      } catch (err) {
        showToast('링크 복사에 실패했습니다.', 'error');
      }
    }
  };

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'REVIEW': return 'bg-red-50 text-red-600 border-red-200';
      case 'TIP': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'QUESTION': return 'bg-blue-50 text-blue-600 border-blue-200';
      default: return 'bg-stone-100 text-stone-600 border-stone-200';
    }
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

  if (isLoading) return <Loading />;

  if (!post || isNaN(postId)) {
    return (
      <div className="text-center py-20">
        <p className="text-stone-500 font-bold">게시글을 찾을 수 없습니다.</p>
        <Link href="/community" className="text-red-600 hover:underline mt-4 inline-block font-bold">
          커뮤니티로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <button onClick={() => router.back()} className="mb-6 flex items-center text-stone-500 hover:text-red-500 transition-colors text-sm font-bold uppercase tracking-wider">
        <ArrowLeft className="w-4 h-4 mr-2" /> 목록으로
      </button>

      <article className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-8">
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className={`text-xs font-black px-3 py-1.5 rounded-lg border uppercase tracking-tighter ${getCategoryStyle(post.category)}`}>
              {getCategoryLabel(post.category)}
            </span>
            {post.storeName && (
              <span className="flex items-center gap-1.5 text-xs text-stone-500 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-100">
                <Store className="w-3.5 h-3.5" /> {post.storeName}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-stone-900 mb-6 leading-tight tracking-tight">
            {post.title}
          </h1>

          <div className="flex items-center justify-between border-b border-stone-100 pb-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-xl shadow-inner border border-stone-200/50">🍜</div>
              <div>
                <div className="font-bold text-stone-900">{post.authorName}</div>
                <div className="text-xs text-stone-400 font-mono">{new Date(post.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          {post.imageUrl && (
            <div className="mb-8 rounded-2xl overflow-hidden border border-stone-100 shadow-lg">
              <img src={post.imageUrl} alt="" className="w-full h-auto max-h-[500px] object-cover" />
            </div>
          )}

          <div 
            className="prose prose-stone max-w-none prose-img:rounded-2xl prose-headings:font-black prose-a:text-red-600 text-stone-700 leading-relaxed text-lg"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        <div className="px-8 py-6 border-t border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-4">
            <button onClick={handleLike} className="flex items-center gap-2 px-6 py-2.5 bg-white border border-stone-200 rounded-full text-stone-600 hover:border-red-300 hover:text-red-500 transition-all font-bold shadow-sm">
              <Heart className="w-4 h-4" /> <span>{post.likeCount}</span>
            </button>
            <button onClick={handleShare} className="flex items-center gap-2 px-6 py-2.5 bg-white border border-stone-200 rounded-full text-stone-600 hover:border-stone-300 transition-all font-bold shadow-sm">
              <Share2 className="w-4 h-4" /> <span className="hidden sm:inline">공유</span>
            </button>
          </div>
          <div className="flex items-center gap-2 text-stone-400 font-bold">
            <MessageCircle className="w-4 h-4" /> <span>댓글 {comments.length}</span>
          </div>
        </div>
      </article>

      <div className="mt-8 bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
          <h3 className="font-black text-stone-900 flex items-center gap-2 uppercase tracking-tighter">
            <MessageCircle className="w-5 h-5 text-red-500" /> Comments ({comments.length})
          </h3>
        </div>

        <div className="divide-y divide-stone-50">
          {comments.length === 0 ? (
            <div className="py-20 text-center text-stone-400">
              <p className="font-bold">아직 댓글이 없습니다.</p>
              <p className="text-sm mt-1">첫 댓글의 주인공이 되어보세요!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.commentId} className="p-6 hover:bg-stone-50/30 transition-colors">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center text-xl shadow-inner border border-stone-200/50 flex-shrink-0">😊</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-stone-900 text-sm">{comment.authorNickname}</span>
                        <span className="text-[10px] text-stone-400 font-mono">{new Date(comment.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                    {comment.taggedParentAuthorNickname && (
                      <span className="inline-block mt-2 text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded font-black">
                        @{comment.taggedParentAuthorNickname}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSubmitComment} className="p-6 border-t border-stone-100 bg-stone-50">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm border border-stone-200 flex-shrink-0">🍜</div>
            <div className="flex-1 flex gap-3">
              <input
                type="text"
                placeholder={isLoggedIn ? "댓글을 입력하세요..." : "로그인 후 이용 가능합니다."}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={!isLoggedIn || isSubmitting}
                className="flex-1 px-5 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500 transition-all font-medium"
              />
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmitting || !isLoggedIn}
                className="px-6 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-red-200 flex items-center justify-center"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="mt-10 text-center">
        <Link href="/community" className="inline-flex items-center gap-2 px-8 py-3 bg-stone-900 text-white font-bold rounded-xl hover:bg-red-600 transition-all shadow-lg hover:shadow-red-600/20">
          <ArrowLeft className="w-4 h-4" /> 목록으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
