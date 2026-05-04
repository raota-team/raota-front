import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description: '라오타 RAOTA 개인정보처리방침입니다.',
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl pt-12 pb-20 md:pt-16">
      <div className="mb-10 border-b border-stone-200 pb-8">
        <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-[#e60000]">Privacy</p>
        <h1 className="text-4xl font-black tracking-tight text-[#25282b] md:text-5xl">개인정보처리방침</h1>
        <p className="mt-4 text-sm font-medium text-[#7e7e7e]">시행일: 2026년 5월 4일</p>
      </div>

      <div className="space-y-8 text-base leading-8 text-[#25282b]">
        <section>
          <h2 className="mb-3 text-xl font-black">1. 수집하는 정보</h2>
          <p>RAOTA는 로그인 제공자 식별 정보, 닉네임, 프로필 이미지, 사용자가 직접 작성한 게시글, 댓글, 사진 등의 정보를 처리할 수 있습니다.</p>
        </section>
        <section>
          <h2 className="mb-3 text-xl font-black">2. 이용 목적</h2>
          <p>수집한 정보는 회원 식별, 커뮤니티 운영, 맛집 기록 제공, 서비스 품질 개선, 문의 대응을 위해 사용됩니다.</p>
        </section>
        <section>
          <h2 className="mb-3 text-xl font-black">3. 보관과 삭제</h2>
          <p>회원 정보는 서비스 제공에 필요한 기간 동안 보관되며, 관련 법령 또는 운영상 필요한 경우를 제외하고 요청에 따라 삭제될 수 있습니다.</p>
        </section>
        <section>
          <h2 className="mb-3 text-xl font-black">4. 문의</h2>
          <p>개인정보 관련 문의는 contact@raota.net 으로 접수할 수 있습니다.</p>
        </section>
      </div>
    </article>
  );
}
