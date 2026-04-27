'use client';

import { useState, use, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Heart, Share2, MessageCircle, Send, Store, Loader2, Trash2, Edit3, CornerDownRight, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getCommunityPostDetail, 
  getComments, 
  createComment, 
  deleteComment, 
  updateComment,
  togglePostLike,
  deleteCommunityPost,
} from '@/lib/api/community';
import { useApp } from '@/app/context/AppContext';
import Loading from '@/app/loading';

export default function CommunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast, showConfirm, isLoggedIn, currentUser } = useApp();
  const postId = Number(resolvedParams.id);

  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: number; name: string } | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditingContent] = useState('');

  // 1. 게시글 상세 조회
  const { data: postData, isLoading: isPostLoading, isError: isPostError } = useQuery({
    queryKey: ['community-post', postId],
    queryFn: () => getCommunityPostDetail(postId),
    enabled: !isNaN(postId),
  });

  // 2. 댓글 목록 조회
  const { data: commentsData, isLoading: isCommentsLoading } = useQuery({
    queryKey: ['community-comments', postId],
    queryFn: () => getComments(postId),
    enabled: !isNaN(postId),
  });

  const post = postData?.data;
  const comments = commentsData?.data?.items || [];

  // 작성자 판단 로직
  const isAuthor = useMemo(() => {
    if (!currentUser || !post) return false;
    const currentId = currentUser.user_id || currentUser.id;
    const authorId = post.authorId || post.author_id || post.writerId;
    if (currentId && authorId && String(currentId) === String(authorId)) return true;
    const myNickname = currentUser.nickname?.trim().toLowerCase();
    const targetNickname = post.authorName?.trim().toLowerCase();
    return !!myNickname && myNickname === targetNickname;
  }, [currentUser, post]);

  // 3. 좋아요 토글 Mutation (Optimistic Update)
  const likeMutation = useMutation({
    mutationFn: () => togglePostLike(postId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['community-post', postId] });
      const previousPostData = queryClient.getQueryData(['community-post', postId]);
      queryClient.setQueryData(['community-post', postId], (old: any) => {
        if (!old?.data) return old;
        const currentStatus = old.data.isLiked;
        return {
          ...old,
          data: {
            ...old.data,
            isLiked: !currentStatus,
            likeCount: currentStatus ? old.data.likeCount - 1 : old.data.likeCount + 1
          }
        };
      });
      return { previousPostData };
    },
    onError: (err, variables, context) => {
      if (context?.previousPostData) queryClient.setQueryData(['community-post', postId], context.previousPostData);
      showToast('좋아요 처리에 실패했습니다.', 'error');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['community-post', postId] });
    }
  });

  // 4. 게시글 삭제 Mutation
  const deletePostMutation = useMutation({
    mutationFn: () => deleteCommunityPost(postId),
    onSuccess: () => {
      showToast('게시글이 삭제되었습니다.', 'success');
      // 목록 쿼리 무효화 (상세 페이지에서 나갈 때 목록이 갱신되도록)
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      router.push('/community');
    }
  });

  // 5. 댓글/답글 작성 Mutation
  const commentMutation = useMutation({
    mutationFn: (data: { content: string; parentCommentId?: number | null }) => createComment(postId, data),
    onSuccess: () => {
      setNewComment('');
      setReplyTo(null);
      showToast('댓글이 작성되었습니다!', 'success');
      queryClient.invalidateQueries({ queryKey: ['community-comments', postId] });
    }
  });

  // 6. 댓글 수정 Mutation
  const updateCommentMutation = useMutation({
    mutationFn: ({ id, content }: { id: number; content: string }) => updateComment(id, content),
    onSuccess: () => {
      setEditingCommentId(null);
      showToast('댓글이 수정되었습니다.', 'success');
      queryClient.invalidateQueries({ queryKey: ['community-comments', postId] });
    }
  });

  // 7. 댓글 삭제 Mutation
  const deleteCommentMutation = useMutation({
    mutationFn: (id: number) => deleteComment(id),
    onSuccess: () => {
      showToast('댓글이 삭제되었습니다.', 'success');
      queryClient.invalidateQueries({ queryKey: ['community-comments', postId] });
    }
  });

  const handleLike = () => {
    if (!isLoggedIn) {
      showConfirm('로그인이 필요한 기능입니다. 로그인하시겠습니까?', () => router.push('/login'));
      return;
    }
    likeMutation.mutate();
  };

  const handleDeletePost = () => {
    showConfirm('이 게시글을 정말 삭제하시겠습니까?', () => deletePostMutation.mutate());
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      showConfirm('로그인이 필요한 기능입니다. 로그인하시겠습니까?', () => router.push('/login'));
      return;
    }
    if (!newComment.trim() || commentMutation.isPending) return;
    commentMutation.mutate({ content: newComment.trim(), parentCommentId: replyTo?.id });
  };

  const handleUpdateComment = (id: number) => {
    if (!editContent.trim()) return;
    updateCommentMutation.mutate({ id, content: editContent.trim() });
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

  if (isPostLoading) return <Loading />;
  if (isPostError || !post) return <div className="text-center py-20 font-bold">게시글을 찾을 수 없습니다.</div>;

  const CommentItem = ({ comment, isReply = false }: { comment: any, isReply?: boolean }) => {
    const isEditing = editingCommentId === comment.commentId;
    const currentUserId = currentUser?.user_id || currentUser?.id;
    const isCommentAuthor = currentUser && (
      (comment.authorId && (String(currentUserId) === String(comment.authorId))) ||
      (currentUser.nickname === comment.authorNickname)
    );

    return (
      <div className={`${isReply ? 'pl-14 pr-6 py-4 bg-stone-50/30' : 'p-6'} hover:bg-stone-50/50 transition-colors border-t border-stone-50 first:border-t-0`}>
        <div className="flex gap-4">
          {isReply && <CornerDownRight className="w-4 h-4 text-stone-300 flex-shrink-0 mt-1" />}
          {!isReply && (
            <Link href={`/user/${comment.authorId}`} className="flex-shrink-0">
              <div className="w-10 h-10 bg-stone-100 rounded-xl overflow-hidden shadow-inner border border-stone-200/50">
                {comment.authorImageUrl ? (
                  <img src={comment.authorImageUrl} alt={comment.authorNickname} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl bg-stone-200 text-stone-400">🍜</div>
                )}
              </div>
            </Link>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Link href={`/user/${comment.authorId}`} className="font-bold text-stone-900 hover:text-red-600 transition-colors truncate">
                  <span className={isReply ? 'text-xs' : 'text-sm'}>{comment.authorNickname}</span>
                </Link>
                <span className="text-[10px] text-stone-400 font-mono">{new Date(comment.createdAt).toLocaleString()}</span>
              </div>
              {isCommentAuthor && !comment.isDeleted && (
                <div className="flex gap-2">
                  <button onClick={() => { setEditingCommentId(comment.commentId); setEditingContent(comment.content); }} className="text-[10px] font-bold text-stone-400 hover:text-stone-900 transition-colors">수정</button>
                  <button onClick={() => showConfirm('정말 삭제하시겠습니까?', () => deleteCommentMutation.mutate(comment.commentId))} className="text-[10px] font-bold text-stone-400 hover:text-red-600 transition-colors">삭제</button>
                </div>
              )}
            </div>
            
            {isEditing ? (
              <div className="mt-2 space-y-2">
                <textarea value={editContent} onChange={(e) => setEditingContent(e.target.value)} className="w-full p-3 border border-stone-200 rounded-lg text-sm focus:ring-1 focus:ring-red-500 outline-none" rows={3} autoFocus />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setEditingCommentId(null)} className="px-3 py-1.5 text-xs font-bold text-stone-400 hover:text-stone-600">취소</button>
                  <button onClick={() => handleUpdateComment(comment.commentId)} className="px-3 py-1.5 text-xs font-bold bg-stone-900 text-white rounded-lg">수정 완료</button>
                </div>
              </div>
            ) : (
              <div className="relative">
                {comment.isDeleted ? (
                  <p className="text-stone-400 text-sm py-1" style={{ fontStyle: 'italic' }}>
                    {comment.content}
                  </p>
                ) : (
                  <>
                    <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {comment.taggedParentAuthorNickname && (
                        <span className="text-stone-900 font-black mr-2 bg-stone-100 px-1.5 py-0.5 rounded text-[11px] vertical-middle">
                          @{comment.taggedParentAuthorNickname}
                        </span>
                      )}
                      {comment.content}
                    </p>
                    {!isReply && (
                      <button onClick={() => setReplyTo({ id: comment.commentId, name: comment.authorNickname })} className="mt-2 text-[10px] font-bold text-red-600/70 hover:text-red-600 uppercase tracking-widest">답글 달기</button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto pb-20 px-4 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => router.push('/community')} className="flex items-center text-stone-500 hover:text-red-500 transition-colors text-sm font-bold uppercase tracking-wider">
          <ArrowLeft className="w-4 h-4 mr-2" /> 목록으로
        </button>
      </div>

      <article className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm mb-8">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black px-3 py-1.5 rounded-lg border border-red-100 bg-red-50 text-red-600 uppercase tracking-tighter">
                {getCategoryLabel(post.category)}
              </span>
              {post.storeName && (
                <span className="flex items-center gap-1.5 text-xs text-stone-500 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-100">
                  <Store className="w-3.5 h-3.5" /> {post.storeName}
                </span>
              )}
            </div>
            
            {isAuthor && (
              <div className="flex gap-1">
                <Link href={`/community/edit/${postId}`} className="p-2 text-stone-400 hover:text-stone-900 transition-colors"><Edit3 className="w-5 h-5" /></Link>
                <button onClick={handleDeletePost} className="p-2 text-stone-400 hover:text-red-600 transition-colors"><Trash2 className="w-5 h-5" /></button>
              </div>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-stone-900 mb-6 leading-tight tracking-tight">{post.title}</h1>

          <div className="flex items-center justify-between border-b border-stone-100 pb-6 mb-8">
            <Link href={`/user/${post.authorId}`} className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-stone-100 rounded-full overflow-hidden shadow-inner border border-stone-200/50">
                {post.authorImageUrl ? (
                  <img src={post.authorImageUrl} alt={post.authorName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl bg-stone-200 text-stone-400">🍜</div>
                )}
              </div>
              <div>
                <div className="font-bold text-stone-900 group-hover:text-red-600 transition-colors">{post.authorName}</div>
                <div className="text-xs text-stone-400 font-mono">{new Date(post.createdAt).toLocaleDateString()}</div>
              </div>
            </Link>
          </div>

          {post.imageUrl && (
            <div className="mb-8 rounded-2xl overflow-hidden border border-stone-100 shadow-lg">
              <img src={post.imageUrl} alt="" loading="lazy" className="w-full h-auto max-h-[600px] object-cover" />
            </div>
          )}

          <div className="prose prose-stone max-w-none prose-img:rounded-2xl prose-headings:font-black prose-a:text-red-600 text-stone-700 leading-relaxed text-lg" dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        <div className="px-8 py-6 border-t border-stone-100 flex items-center justify-between bg-stone-50/50">
          <button 
            onClick={handleLike} 
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition-all font-bold shadow-sm border ${
              likeMutation.isPending ? 'opacity-50' : '' 
            } ${
              post.isLiked 
                ? 'bg-red-50 border-red-200 text-red-600' 
                : 'bg-white border-stone-200 text-stone-600 hover:border-red-300'
            }`}
          >
            <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-red-600 text-red-600' : ''}`} /> 
            <span>{post.likeCount}</span>
          </button>
          <div className="flex items-center gap-2 text-stone-400 font-bold">
            <MessageCircle className="w-4 h-4" /> <span>댓글 {comments.length}</span>
          </div>
        </div>
      </article>

      {/* Comments Section */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-stone-100 bg-stone-50/50">
          <h3 className="font-black text-stone-900 flex items-center gap-2 uppercase tracking-tighter">
            <MessageCircle className="w-5 h-5 text-red-500" /> 댓글 ({comments.length})
          </h3>
        </div>

        <div className="divide-y divide-stone-50">
          {isCommentsLoading ? (
             <div className="p-10 flex justify-center"><Loader2 className="w-6 h-6 text-stone-300 animate-spin" /></div>
          ) : comments.length === 0 ? (
            <div className="py-20 text-center text-stone-400 font-bold">아직 댓글이 없습니다.</div>
          ) : (
            comments.map((comment: any) => (
              <div key={comment.commentId}>
                <CommentItem comment={comment} />
                {comment.replies && comment.replies.map((reply: any) => (
                  <CommentItem key={reply.commentId} comment={reply} isReply={true} />
                ))}
              </div>
            ))
          )}
        </div>

        {/* Comment Form */}
        <form onSubmit={handleSubmitComment} className="p-4 md:p-6 border-t border-stone-100 bg-stone-50">
          {replyTo && (
            <div className="mb-3 flex items-center justify-between bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 animate-in slide-in-from-top-2">
              <span className="text-xs font-bold text-red-600 flex items-center gap-2">
                <CornerDownRight className="w-3 h-3" /> @{replyTo.name} 님에게 답글 남기는 중
              </span>
              <button type="button" onClick={() => setReplyTo(null)} className="text-red-400 hover:text-red-600"><X className="w-3.5 h-3.5" /></button>
            </div>
          )}
          <div className="flex gap-2 md:gap-4 items-center">
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                placeholder={isLoggedIn ? (replyTo ? "답글을 입력하세요..." : "댓글을 입력하세요...") : "로그인 후 이용 가능합니다."}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={!isLoggedIn || commentMutation.isPending}
                className="flex-1 min-w-0 px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-100 transition-all font-medium"
              />
              <button
                type="submit"
                disabled={!newComment.trim() || commentMutation.isPending || !isLoggedIn}
                className="px-4 md:px-6 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center shadow-md flex-shrink-0"
              >
                {commentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="mt-8 flex justify-center">
        <button 
          onClick={() => router.push('/community')} 
          className="flex items-center gap-2 px-8 py-3 bg-white border border-stone-200 text-stone-600 rounded-full hover:bg-stone-50 hover:border-stone-300 transition-all font-bold shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          목록으로 돌아가기
        </button>
      </div>
    </div>
  );
}
