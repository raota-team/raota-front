'use client';

import { memo, useState, use, useEffect, useMemo, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, Heart, MessageCircle, Send, Store, Loader2, Trash2, Edit3, CornerDownRight, X, Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getCommunityPostDetail, 
  getComments, 
  createComment, 
  deleteComment, 
  updateComment,
  togglePostLike,
  deleteCommunityPost,
  getCommunityPosts,
  type CommunityPostCard,
  increasePostViewCount,
} from '@/lib/api/community';
import { useApp } from '@/app/context/AppContext';
import Loading from '@/app/loading';

const hotPostCardClass = "flex h-24 w-[13.5rem] flex-shrink-0 snap-start gap-2.5 rounded-sm border border-stone-200 bg-white p-3 transition-colors hover:border-[#e60000] sm:h-28 sm:w-[17rem] sm:gap-3 md:w-[calc((100%-1.5rem)/3)] md:max-w-none";

interface CommunityDetailPageProps {
  params: Promise<{ id: string }>;
  initialPost?: any;
}

const enhanceContentImages = (html: string, title: string) => {
  let imageIndex = 0;
  const escapedTitle = title.replace(/"/g, '&quot;');

  return html.replace(/<img\b([^>]*)>/gi, (match, attributes: string) => {
    const isFirstImage = imageIndex === 0;
    imageIndex += 1;

    const additions = [
      /\salt=/i.test(attributes) ? '' : ` alt="${escapedTitle} 이미지 ${imageIndex}"`,
      /\sloading=/i.test(attributes) || isFirstImage ? '' : ' loading="lazy"',
      /\sdecoding=/i.test(attributes) ? '' : ' decoding="async"',
      /\sfetchpriority=/i.test(attributes) || !isFirstImage ? '' : ' fetchpriority="high"',
      /\swidth=/i.test(attributes) ? '' : ' width="800"',
      /\sheight=/i.test(attributes) ? '' : ' height="600"',
    ].join('');

    return `<img${attributes}${additions}>`;
  });
};

const CommentItem = memo(function CommentItem({
  comment,
  isReply = false,
  currentUser,
  editingCommentId,
  onStartEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
  onReply,
}: {
  comment: any;
  isReply?: boolean;
  currentUser: any;
  editingCommentId: number | null;
  onStartEdit: (commentId: number) => void;
  onCancelEdit: () => void;
  onUpdate: (commentId: number, content: string) => void;
  onDelete: (commentId: number) => void;
  onReply: (commentId: number, authorNickname: string) => void;
}) {
  const isEditing = editingCommentId === comment.commentId;
  const [draftContent, setDraftContent] = useState(comment.content ?? '');
  const currentUserId = currentUser?.user_id || currentUser?.id;
  const isCommentAuthor = currentUser && (
    (comment.authorId && (String(currentUserId) === String(comment.authorId))) ||
    (currentUser.nickname === comment.authorNickname)
  );

  useEffect(() => {
    if (isEditing) {
      setDraftContent(comment.content ?? '');
    }
  }, [comment.content, isEditing]);

  return (
    <div className={`${isReply ? 'bg-stone-50 py-3 pl-9 pr-4 md:py-4 md:pl-14 md:pr-6' : 'p-4 md:p-6'} border-t border-stone-100 first:border-t-0`}>
      <div className="flex gap-3 md:gap-4">
        {isReply && <CornerDownRight className="mt-1 h-3.5 w-3.5 flex-shrink-0 text-stone-300 md:h-4 md:w-4" />}
        {!isReply && (
          <Link href={`/user/${comment.authorId}`} className="flex-shrink-0">
            <div className="relative h-9 w-9 overflow-hidden rounded-full border border-stone-200 bg-stone-100 md:h-10 md:w-10">
              {comment.authorImageUrl ? (
                <Image
                  src={comment.authorImageUrl}
                  alt={comment.authorNickname}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-stone-200 text-lg text-stone-400 md:text-xl">🍜</div>
              )}
            </div>
          </Link>
        )}
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-0.5 md:flex-row md:items-center md:gap-3">
              <Link href={`/user/${comment.authorId}`} className="truncate font-bold text-[#25282b] transition-colors hover:text-[#e60000]">
                <span className={isReply ? 'text-xs' : 'text-sm'}>{comment.authorNickname}</span>
              </Link>
              <span className="font-mono text-[10px] text-stone-600">{new Date(comment.createdAt).toLocaleString()}</span>
            </div>
            {isCommentAuthor && !comment.isDeleted && (
              <div className="flex gap-2">
                <button type="button" onClick={() => onStartEdit(comment.commentId)} className="text-[10px] font-bold text-stone-600 transition-colors hover:text-[#25282b]">수정</button>
                <button type="button" onClick={() => onDelete(comment.commentId)} className="text-[10px] font-bold text-stone-600 transition-colors hover:text-[#e60000]">삭제</button>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="mt-2 space-y-2">
              <textarea value={draftContent} onChange={(e) => setDraftContent(e.target.value)} className="w-full rounded-sm border border-stone-200 p-3 text-sm outline-none focus:border-[#e60000]" rows={3} autoFocus />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={onCancelEdit} className="px-3 py-1.5 text-xs font-bold text-stone-600 hover:text-stone-800">취소</button>
                <button type="button" onClick={() => onUpdate(comment.commentId, draftContent)} className="rounded-sm bg-[#25282b] px-3 py-1.5 text-xs font-bold text-white">수정 완료</button>
              </div>
            </div>
          ) : (
            <div className="relative">
              {comment.isDeleted ? (
                <p className="py-1 text-sm text-stone-600" style={{ fontStyle: 'italic' }}>
                  {comment.content}
                </p>
              ) : (
                <>
                  <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-[#25282b] md:text-sm">
                    {comment.taggedParentAuthorNickname && (
                      <span className="vertical-middle mr-2 rounded-sm bg-stone-100 px-1.5 py-0.5 text-[11px] font-black text-[#25282b]">
                        @{comment.taggedParentAuthorNickname}
                      </span>
                    )}
                    {comment.content}
                  </p>
                  {!isReply && (
                    <button type="button" onClick={() => onReply(comment.commentId, comment.authorNickname)} className="mt-2 text-[10px] font-bold uppercase tracking-widest text-[#b80000] hover:text-[#e60000]">답글 달기</button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

const CommentForm = memo(function CommentForm({
  isLoggedIn,
  replyTo,
  isPending,
  onSubmit,
  onCancelReply,
}: {
  isLoggedIn: boolean;
  replyTo: { id: number; name: string } | null;
  isPending: boolean;
  onSubmit: (content: string, parentCommentId?: number | null) => void;
  onCancelReply: () => void;
}) {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isPending || !isLoggedIn) return;
    onSubmit(content.trim(), replyTo?.id);
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-stone-100 bg-stone-50 p-4 md:p-6">
      {replyTo && (
        <div className="animate-in slide-in-from-top-2 mb-3 flex items-center justify-between rounded-sm border border-[#e60000] bg-white px-3 py-2">
          <span className="flex items-center gap-2 text-xs font-bold text-[#e60000]">
            <CornerDownRight className="h-3 w-3" /> @{replyTo.name} 님에게 답글 남기는 중
          </span>
          <button type="button" onClick={onCancelReply} className="text-[#b80000] hover:text-[#e60000]" aria-label="답글 입력 취소"><X className="h-3.5 w-3.5" /></button>
        </div>
      )}
      <div className="flex items-center gap-2 md:gap-4">
        <div className="flex flex-1 gap-2">
          <input
            type="text"
            placeholder={isLoggedIn ? (replyTo ? "답글을 입력하세요..." : "댓글을 입력하세요...") : "로그인 후 이용 가능합니다."}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={!isLoggedIn || isPending}
            className="min-w-0 flex-1 rounded-sm border border-stone-200 bg-white px-4 py-3 text-sm font-medium transition-colors focus:border-[#e60000] focus:outline-none"
          />
          <button
            type="submit"
            aria-label={replyTo ? '답글 등록하기' : '댓글 등록하기'}
            disabled={!content.trim() || isPending || !isLoggedIn}
            className="flex flex-shrink-0 items-center justify-center rounded-sm bg-[#e60000] px-4 text-white transition-opacity hover:opacity-90 disabled:opacity-50 md:px-6"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </form>
  );
});

export default function CommunityDetailPage({ params, initialPost }: CommunityDetailPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast, showConfirm, isLoggedIn, isAuthChecking, currentUser } = useApp();
  const postId = Number(resolvedParams.id);

  const [replyTo, setReplyTo] = useState<{ id: number; name: string } | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const hotPostsRef = useRef<HTMLDivElement>(null);

  // 조회수 증가 API 호출 (화면이 완전히 뜬 후 단 한 번 호출)
  useEffect(() => {
    if (postId) {
      increasePostViewCount(postId).catch((err) => {
        console.error("Failed to increase post view count:", err);
      });
    }
  }, [postId]);

  // 1. 게시글 상세 조회
  const { data: postData, isLoading: isPostLoading, isError: isPostError } = useQuery({
    queryKey: ['community-post', postId, isLoggedIn ? 'auth' : 'guest', currentUser?.user_id ?? currentUser?.id ?? null],
    queryFn: () => getCommunityPostDetail(postId),
    enabled: !isNaN(postId) && !isAuthChecking && (isLoggedIn || !initialPost),
    initialData: initialPost ? { data: initialPost } : undefined,
    refetchOnMount: isLoggedIn ? 'always' : false,
  });

  // 2. 댓글 목록 조회
  const { data: commentsData, isLoading: isCommentsLoading } = useQuery({
    queryKey: ['community-comments', postId],
    queryFn: () => getComments(postId),
    enabled: !isNaN(postId),
  });

  const { data: hotPostsData } = useQuery({
    queryKey: ['community-hot-posts'],
    queryFn: () => getCommunityPosts({ page: 0, size: 20 }),
    staleTime: 60 * 1000,
  });

  const post = postData?.data;
  const comments = commentsData?.data?.items || [];
  const hotPosts = useMemo(() => {
    const items: CommunityPostCard[] = hotPostsData?.data?.items || [];
    const sortedPosts = [...items]
      .filter((item) => item.postId !== postId)
      .sort((a, b) => (b.likeCount + b.commentCount * 2) - (a.likeCount + a.commentCount * 2))
      .slice(0, 8);

    return sortedPosts;
  }, [hotPostsData, postId]);
  const enhancedPostContent = useMemo(
    () => enhanceContentImages(post?.content ?? '', post?.title ?? '라오타 커뮤니티 게시글'),
    [post?.content, post?.title],
  );

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
      const postQueryKey = ['community-post', postId, isLoggedIn ? 'auth' : 'guest', currentUser?.user_id ?? currentUser?.id ?? null];
      const previousPostData = queryClient.getQueryData(postQueryKey);
      queryClient.setQueryData(postQueryKey, (old: any) => {
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
      const postQueryKey = ['community-post', postId, isLoggedIn ? 'auth' : 'guest', currentUser?.user_id ?? currentUser?.id ?? null];
      if (context?.previousPostData) queryClient.setQueryData(postQueryKey, context.previousPostData);
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

  const handleSubmitComment = useCallback((content: string, parentCommentId?: number | null) => {
    if (!isLoggedIn) {
      showConfirm('로그인이 필요한 기능입니다. 로그인하시겠습니까?', () => router.push('/login'));
      return;
    }
    if (!content.trim() || commentMutation.isPending) return;
    commentMutation.mutate({ content: content.trim(), parentCommentId });
  }, [commentMutation, isLoggedIn, router, showConfirm]);

  const handleStartEditComment = useCallback((id: number) => {
    setEditingCommentId(id);
  }, []);

  const handleCancelEditComment = useCallback(() => {
    setEditingCommentId(null);
  }, []);

  const handleUpdateComment = useCallback((id: number, content: string) => {
    if (!content.trim() || updateCommentMutation.isPending) return;
    updateCommentMutation.mutate({ id, content: content.trim() });
  }, [updateCommentMutation]);

  const handleDeleteComment = useCallback((id: number) => {
    showConfirm('정말 삭제하시겠습니까?', () => deleteCommentMutation.mutate(id));
  }, [deleteCommentMutation, showConfirm]);

  const handleReplyComment = useCallback((id: number, name: string) => {
    setReplyTo({ id, name });
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyTo(null);
  }, []);

  const scrollHotPosts = (direction: 'prev' | 'next') => {
    const scrollAmount = hotPostsRef.current?.clientWidth || 320;
    hotPostsRef.current?.scrollBy({
      left: direction === 'next' ? scrollAmount : -scrollAmount,
      behavior: 'smooth',
    });
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

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => router.push('/community')} className="flex items-center text-sm font-bold uppercase tracking-wider text-stone-600 transition-colors hover:text-[#e60000]">
          <ArrowLeft className="w-4 h-4 mr-2" /> 목록으로
        </button>
      </div>

      <article className="mb-6 overflow-hidden rounded-sm border border-stone-200 bg-white md:mb-8">
        <div className="p-5 md:p-8">
          <div className="mb-5 flex items-start justify-between md:mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-sm border border-[#e60000] bg-white px-2.5 py-1 text-[11px] font-black uppercase tracking-tighter text-[#25282b] md:px-3 md:py-1.5 md:text-xs">
                {getCategoryLabel(post.category)}
              </span>
              {post.storeName && (
                <span className="flex items-center gap-1.5 rounded-sm border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] text-stone-700 md:px-3 md:py-1.5 md:text-xs">
                  <Store className="w-3.5 h-3.5" /> {post.storeName}
                </span>
              )}
            </div>
            
            {isAuthor && (
              <div className="flex gap-1">
                <Link href={`/community/edit/${postId}`} className="p-2 text-stone-600 hover:text-stone-900 transition-colors" aria-label="게시글 수정"><Edit3 className="w-5 h-5" /></Link>
                <button onClick={handleDeletePost} className="p-2 text-stone-600 transition-colors hover:text-[#e60000]" aria-label="게시글 삭제"><Trash2 className="h-5 w-5" /></button>
              </div>
            )}
          </div>

          <h1 className="mb-5 text-2xl font-black leading-snug tracking-tight text-[#25282b] md:mb-6 md:text-5xl md:leading-tight">{post.title}</h1>

          <div className="mb-6 flex items-center justify-between border-b border-stone-100 pb-5 md:mb-8 md:pb-6">
            <Link href={`/user/${post.authorId}`} className="flex items-center gap-3 group">
              <div className="relative h-9 w-9 overflow-hidden rounded-full border border-stone-200 bg-stone-100 md:h-10 md:w-10">
                {post.authorImageUrl ? (
                  <Image
                    src={post.authorImageUrl}
                    alt={post.authorName}
                    fill
                    priority
                    sizes="40px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg bg-stone-200 text-stone-400 md:text-xl">🍜</div>
                )}
              </div>
              <div>
                <div className="text-sm font-bold text-[#25282b] transition-colors group-hover:text-[#e60000] md:text-base">{post.authorName}</div>
                <div className="text-xs text-stone-600 font-mono">{new Date(post.createdAt).toLocaleDateString()}</div>
              </div>
            </Link>
          </div>

          {post.imageUrl && (
            <div className="relative mb-6 aspect-[4/3] overflow-hidden rounded-md border border-stone-100 md:mb-8">
              <Image
                src={post.imageUrl}
                alt={`${post.title} 게시글 이미지`}
                fill
                priority
                sizes="(min-width: 768px) 768px, calc(100vw - 40px)"
                className="object-cover"
              />
            </div>
          )}

          <div className="prose prose-sm prose-stone max-w-none leading-relaxed text-[#25282b] prose-headings:font-black prose-img:h-auto prose-img:w-full prose-img:rounded-md prose-a:text-[#3860be] md:prose-base md:text-lg" dangerouslySetInnerHTML={{ __html: enhancedPostContent }} />
        </div>

        <div className="flex items-center justify-between border-t border-stone-100 bg-stone-50 px-5 py-4 md:px-8 md:py-6">
          <button 
            onClick={handleLike} 
            className={`flex items-center gap-2 rounded-sm border px-4 py-2 text-sm font-bold transition-colors md:px-6 md:py-2.5 md:text-base ${
              likeMutation.isPending ? 'opacity-50' : '' 
            } ${
              post.isLiked 
                ? 'border-[#e60000] bg-[#e60000] text-white' 
                : 'border-stone-200 bg-white text-stone-600 hover:border-[#e60000]'
            }`}
          >
            <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-white text-white' : ''}`} /> 
            <span>{post.likeCount}</span>
          </button>
          <div className="flex items-center gap-4 text-sm font-bold text-stone-600 md:text-base">
            <span className="flex items-center gap-2"><Eye className="w-4 h-4" /> 조회 {post.viewCount}</span>
            <span className="flex items-center gap-2"><MessageCircle className="w-4 h-4" /> 댓글 {comments.length}</span>
          </div>
        </div>
      </article>

      {/* Comments Section */}
      <div className="overflow-hidden rounded-sm border border-stone-200 bg-white">
        <div className="border-b border-stone-100 bg-stone-50 p-4 md:p-6">
          <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-tighter text-[#25282b] md:text-base">
            <MessageCircle className="h-4 w-4 text-[#e60000] md:h-5 md:w-5" /> 댓글 ({comments.length})
          </h2>
        </div>

        <div className="divide-y divide-stone-50">
          {isCommentsLoading ? (
             <div className="p-10 flex justify-center"><Loader2 className="w-6 h-6 text-stone-300 animate-spin" /></div>
          ) : comments.length === 0 ? (
            <div className="py-16 text-center text-sm font-bold text-stone-600 md:py-20 md:text-base">아직 댓글이 없습니다.</div>
          ) : (
            comments.map((comment: any) => (
              <div key={comment.commentId}>
                <CommentItem
                  comment={comment}
                  currentUser={currentUser}
                  editingCommentId={editingCommentId}
                  onStartEdit={handleStartEditComment}
                  onCancelEdit={handleCancelEditComment}
                  onUpdate={handleUpdateComment}
                  onDelete={handleDeleteComment}
                  onReply={handleReplyComment}
                />
                {comment.replies && comment.replies.map((reply: any) => (
                  <CommentItem
                    key={reply.commentId}
                    comment={reply}
                    isReply={true}
                    currentUser={currentUser}
                    editingCommentId={editingCommentId}
                    onStartEdit={handleStartEditComment}
                    onCancelEdit={handleCancelEditComment}
                    onUpdate={handleUpdateComment}
                    onDelete={handleDeleteComment}
                    onReply={handleReplyComment}
                  />
                ))}
              </div>
            ))
          )}
        </div>

        {/* Comment Form */}
        <CommentForm
          isLoggedIn={isLoggedIn}
          replyTo={replyTo}
          isPending={commentMutation.isPending}
          onSubmit={handleSubmitComment}
          onCancelReply={handleCancelReply}
        />
      </div>

      <div className="mt-8 flex justify-center">
        <button 
          onClick={() => router.push('/community')} 
          className="flex items-center gap-2 rounded-sm border border-stone-200 bg-white px-6 py-2.5 text-sm font-bold text-stone-600 transition-colors hover:border-[#25282b] hover:bg-stone-50 md:px-8 md:py-3 md:text-base"
        >
          <ArrowLeft className="w-4 h-4" />
          목록으로 돌아가기
        </button>
      </div>

      {hotPosts.length > 0 && (
        <section className="mt-8 min-w-0 border-t border-stone-200 py-4 md:mt-10 md:py-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[#25282b]">
              <Flame className="h-4 w-4 text-[#e60000]" />
              지금 핫한 게시물
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollHotPosts('prev')}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 transition-colors hover:border-[#e60000] hover:text-[#e60000]"
                aria-label="이전 핫한 게시물"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollHotPosts('next')}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 transition-colors hover:border-[#e60000] hover:text-[#e60000]"
                aria-label="다음 핫한 게시물"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div
            ref={hotPostsRef}
            className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
          >
            {hotPosts.map((hotPost) => (
              <Link key={hotPost.postId} href={`/community/${hotPost.postId}`} className={hotPostCardClass}>
                {hotPost.imageUrl && (
                  <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-sm bg-stone-100 sm:h-16 sm:w-16">
                    <Image
                      src={hotPost.imageUrl}
                      alt={hotPost.title}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-stone-600">
                    <span className="text-[#e60000]">{getCategoryLabel(hotPost.category)}</span>
                    <span>{new Date(hotPost.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="line-clamp-2 text-[13px] font-black leading-4 text-[#25282b] sm:text-sm sm:leading-5">{hotPost.title}</p>
                  <div className="mt-auto flex items-center gap-3 text-[11px] font-bold text-stone-600 sm:text-xs">
                    <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> {hotPost.likeCount}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> {hotPost.commentCount}</span>
                    <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {hotPost.viewCount}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
