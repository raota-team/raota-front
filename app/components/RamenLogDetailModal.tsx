'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { formatRamenLogDate } from '@/app/components/RamenLogCard';
import { getRamenLog, TASTE_NOTE_GROUPS, type RamenLog, type RamenLogDetail } from '@/lib/api/ramen-logs';

const PhotoModal = dynamic(() => import('@/app/components/PhotoModal'), { ssr: false });

/** 목록 카드의 기록으로 먼저 띄우고, 상세(사진·댓글 미리보기)가 오면 바꿔 보여준다 */
export default function RamenLogDetailModal({ log, onClose }: { log: RamenLog; onClose: () => void }) {
  const [detail, setDetail] = useState<RamenLogDetail | null>(null);

  useEffect(() => {
    let isCancelled = false;
    setDetail(null);
    getRamenLog(log.id)
      .then((result) => {
        if (!isCancelled) setDetail(result);
      })
      .catch((error) => console.error('Failed to fetch ramen log detail:', error));
    return () => {
      isCancelled = true;
    };
  }, [log.id]);

  const shown = detail ?? log;

  return (
    <PhotoModal
      photo={{
        id: shown.id,
        imageUrl: shown.imageUrl,
        imageUrls: shown.imageUrls,
        menuName: shown.menuName,
        user: shown.author.name,
        userId: shown.author.profileId,
        userImageUrl: shown.author.imageUrl,
        restaurantName: shown.shop.name,
        restaurantId: shown.shop.id,
        date: formatRamenLogDate(shown.date),
        comment: shown.note,
        revisit: shown.revisit,
        scores: shown.scores,
        likes: shown.likes,
        commentCount: shown.commentCount,
        comments: detail?.comments,
        tasteNotes: TASTE_NOTE_GROUPS
          .filter(({ key }) => shown.tasteNotes[key].length > 0)
          .map(({ key, label }) => ({ label, values: shown.tasteNotes[key] })),
      }}
      onClose={onClose}
    />
  );
}
