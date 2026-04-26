import { Metadata } from 'next';
import { getCommunityPostDetail } from '@/lib/api/community';
import CommunityDetailClient from './CommunityDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

// 1. 동적 메타데이터 생성 (SEO의 핵심)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const postId = Number(id);

  try {
    const res = await getCommunityPostDetail(postId);
    const post = res.data;

    return {
      title: post.title,
      description:
        post.contentPreview ||
        `${post.authorName}님의 라멘 후기와 일본라멘 이야기를 라오타(RAOTA)에서 확인해보세요.`,
      keywords: ['라오타', 'RAOTA', 'raota', '라멘', '일본라멘', '라멘 후기', post.title],
      alternates: {
        canonical: `/community/${postId}`,
      },
      openGraph: {
        title: `${post.title} | 라오타 RAOTA 라멘 커뮤니티`,
        description: post.contentPreview,
        url: `/community/${postId}`,
        images: post.imageUrl ? [post.imageUrl] : ['/hero-ramen.webp'],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.contentPreview,
        images: post.imageUrl ? [post.imageUrl] : ['/hero-ramen.webp'],
      },
    };
  } catch (error) {
    return {
      title: '게시글을 찾을 수 없습니다',
    };
  }
}

// 2. 실제 페이지 렌더링 (서버에서 클라이언트로 넘겨줌)
export default async function Page({ params }: Props) {
  return <CommunityDetailClient params={params} />;
}
