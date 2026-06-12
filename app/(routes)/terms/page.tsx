import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '이용약관',
  description: '라오타 RAOTA 서비스 이용약관입니다.',
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 pt-12 pb-20 md:pt-16">
      <div className="mb-10 border-b border-stone-200 pb-8">
        <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-[#e60000]">Legal</p>
        <h1 className="text-4xl font-black tracking-tight text-[#25282b] md:text-5xl">이용약관</h1>
        <p className="mt-4 text-sm font-medium text-[#7e7e7e]">시행일: 2026년 6월 11일</p>
      </div>

      <div className="space-y-8 text-base leading-8 text-[#25282b]">
        <section>
          <h2 className="mb-3 text-xl font-black">1. 목적</h2>
          <p>
            본 약관은 RAOTA(이하 “서비스”)가 제공하는 라멘 맛집 정보, 추천, 커뮤니티, 사진 인증 및 관련 기능의 이용 조건,
            회원과 운영자의 권리·의무, 서비스 이용 절차를 정하는 것을 목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-black">2. 용어의 정의</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>“회원”이란 OAuth 로그인 및 프로필 등록 등 서비스가 정한 절차에 따라 서비스를 이용하는 이용자를 말합니다.</li>
            <li>“콘텐츠”란 회원이 작성하거나 업로드한 게시글, 댓글, 사진, 리뷰, 프로필 정보 및 기타 자료를 말합니다.</li>
            <li>“가게 정보”란 라멘 가게의 위치, 메뉴, 태그, 사진, 이용자 반응 등 서비스 내에서 제공되는 정보를 말합니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-black">3. 약관의 게시와 변경</h2>
          <p>
            서비스는 본 약관을 이용자가 쉽게 확인할 수 있도록 서비스 화면에 게시합니다. 운영상 필요하거나 관계 법령이 변경되는 경우
            약관을 개정할 수 있으며, 중요한 변경이 있는 경우 시행일, 변경 내용 및 사유를 서비스 내 공지 등 적절한 방법으로 안내합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-black">4. 회원가입과 계정 관리</h2>
          <p>
            회원은 서비스가 지원하는 OAuth 로그인 및 추가 프로필 등록을 통해 계정을 만들 수 있습니다. 회원은 본인의 계정을 직접 관리해야 하며,
            계정 정보가 부정확하거나 제3자에게 무단 이용된 사실을 알게 된 경우 즉시 서비스에 알려야 합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-black">5. 서비스의 제공</h2>
          <p>
            서비스는 라멘 가게 탐색, AI 추천, 가게 비교, 커뮤니티 게시글 작성, 댓글, 사진 인증, 북마크 등 기능을 제공합니다.
            서비스의 구체적인 기능, 화면, 데이터, 운영 정책은 안정적인 제공과 품질 개선을 위해 변경될 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-black">6. 회원의 의무와 금지행위</h2>
          <p className="mb-3">회원은 관계 법령, 본 약관 및 서비스 이용 안내를 준수해야 하며, 다음 행위를 해서는 안 됩니다.</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>타인의 개인정보, 계정, 콘텐츠를 무단으로 이용하거나 사칭하는 행위</li>
            <li>허위 정보, 광고성 정보, 음란·혐오·차별·폭력적 표현 등 부적절한 콘텐츠를 게시하는 행위</li>
            <li>타인의 저작권, 초상권, 상표권, 명예 등 권리를 침해하는 행위</li>
            <li>서비스의 정상적인 운영을 방해하거나 보안 취약점을 악용하는 행위</li>
            <li>자동화된 수단으로 과도한 요청을 보내거나 데이터를 무단 수집하는 행위</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-black">7. 회원 콘텐츠와 이용 범위</h2>
          <p>
            회원이 서비스에 게시한 콘텐츠의 권리는 원칙적으로 해당 회원에게 있습니다. 다만 회원은 서비스 운영, 노출, 검색, 추천,
            통계, 홍보 및 기능 개선을 위해 필요한 범위에서 서비스가 해당 콘텐츠를 저장, 복제, 표시, 편집 형식으로 변환,
            배포할 수 있도록 허락합니다. 회원은 본인이 게시한 콘텐츠가 제3자의 권리를 침해하지 않도록 해야 합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-black">8. 콘텐츠 관리와 이용 제한</h2>
          <p>
            서비스는 신고, 모니터링 또는 운영상 확인을 통해 본 약관이나 관계 법령을 위반한 콘텐츠를 숨김, 삭제, 수정 요청하거나
            회원의 이용을 일시 또는 영구적으로 제한할 수 있습니다. 긴급한 피해 방지나 법적 요청 대응이 필요한 경우 사전 통지 없이 조치할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-black">9. 서비스의 변경, 중단</h2>
          <p>
            서비스는 설비 점검, 장애, 보안 대응, 외부 서비스 장애, 운영 정책 변경 등 필요한 경우 서비스의 전부 또는 일부를
            변경하거나 일시 중단할 수 있습니다. 예정된 중단은 가능한 범위에서 사전에 안내합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-black">10. 정보의 정확성과 책임 제한</h2>
          <p>
            서비스 내 가게 정보, 메뉴, 위치, 영업시간, 추천 결과 등은 회원 입력, 공개 자료, 외부 데이터 및 운영자 검수 결과를 바탕으로 제공되며
            실제 정보와 다를 수 있습니다. 방문, 예약, 결제 등 중요한 의사결정 전에는 해당 가게 또는 공식 채널을 통해 최신 정보를 확인해야 합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-black">11. 탈퇴와 이용 종료</h2>
          <p>
            회원은 서비스가 제공하는 방법 또는 문의를 통해 계정 탈퇴를 요청할 수 있습니다. 탈퇴 시 관련 법령, 분쟁 대응,
            부정 이용 방지 등을 위해 필요한 정보를 제외하고 개인정보는 처리방침에 따라 30일간 보관 후 삭제 또는 익명화됩니다. 단, 회원이 공개 영역에 게시한 글과 댓글은
            다른 이용자의 정상적인 서비스 이용을 위해 삭제되지 않을 수 있으며, 작성자 프로필은 탈퇴한 사용자로 표시될 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-black">12. 준거법과 분쟁 해결</h2>
          <p>
            본 약관은 대한민국 법령에 따라 해석됩니다. 서비스 이용과 관련하여 분쟁이 발생한 경우 회원과 서비스는 원만한 해결을 위해
            성실히 협의하며, 협의가 어려운 경우 관계 법령에서 정한 관할 법원 또는 절차에 따릅니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-black">13. 문의</h2>
          <p>서비스 이용 및 약관 관련 문의는 contact@raota.net 으로 접수할 수 있습니다.</p>
        </section>
      </div>
    </article>
  );
}
