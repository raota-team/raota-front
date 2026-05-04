import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '이용약관',
  description: '라오타 RAOTA 서비스 이용약관입니다.',
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl pt-12 pb-20 md:pt-16">
      <div className="mb-10 border-b border-stone-200 pb-8">
        <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-[#e60000]">Legal</p>
        <h1 className="text-4xl font-black tracking-tight text-[#25282b] md:text-5xl">이용약관</h1>
        <p className="mt-4 text-sm font-medium text-[#7e7e7e]">시행일: 2026년 5월 4일</p>
      </div>

      <div className="space-y-8 text-base leading-8 text-[#25282b]">
        <section>
          <h2 className="mb-3 text-xl font-black">1. 목적</h2>
          <p>본 약관은 RAOTA가 제공하는 라멘 맛집 정보, 커뮤니티, 사용자 콘텐츠 관련 서비스 이용 조건과 절차를 정합니다.</p>
        </section>
        <section>
          <h2 className="mb-3 text-xl font-black">2. 회원과 계정</h2>
          <p>회원은 OAuth 로그인 및 추가 프로필 등록을 통해 서비스를 이용할 수 있으며, 본인의 계정 정보를 정확하게 관리해야 합니다.</p>
        </section>
        <section>
          <h2 className="mb-3 text-xl font-black">3. 콘텐츠</h2>
          <p>회원이 작성한 게시글, 댓글, 사진은 서비스 운영과 노출을 위해 필요한 범위에서 사용될 수 있습니다. 타인의 권리를 침해하거나 부적절한 콘텐츠는 제한될 수 있습니다.</p>
        </section>
        <section>
          <h2 className="mb-3 text-xl font-black">4. 서비스 변경</h2>
          <p>서비스 기능, 데이터, 운영 정책은 안정적인 제공을 위해 변경될 수 있습니다.</p>
        </section>
      </div>
    </article>
  );
}
