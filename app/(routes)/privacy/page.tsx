import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description: '라오타 RAOTA 개인정보처리방침입니다.',
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 pt-12 pb-20 md:pt-16">
      <div className="mb-10 border-b border-stone-200 pb-8">
        <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-[#e60000]">Privacy</p>
        <h1 className="text-4xl font-black tracking-tight text-[#25282b] md:text-5xl">개인정보처리방침</h1>
        <p className="mt-4 text-sm font-medium text-[#7e7e7e]">시행일: 2026년 11월 3일</p>
        <div className="mt-6 rounded-lg bg-[#f2f2f2] px-4 py-3 text-sm leading-6 text-[#25282b]">
          <p className="font-black">개정 안내</p>
          <p className="mt-1">
            2026년 11월 3일부터 개정 처리방침이 적용됩니다. 제6조(위탁)와 제7조(국외 이전)에 실제 수탁자와 이전받는 자를 밝히고,
            앱 이용 통계와 앱 오류 수집(제2조·제3조·제10조)을 추가했습니다. 시행일 전까지는 이전 처리방침이 적용됩니다.{' '}
            <a href="/privacy/2026-10-27" className="underline underline-offset-4">이전 처리방침 보기</a>
          </p>
        </div>
      </div>

      <div className="space-y-8 text-base leading-8 text-[#25282b]">
        <section>
          <h2 className="mb-3 text-xl font-black">1. 개인정보의 처리 목적</h2>
          <p className="mb-3">
            RAOTA는 다음 목적을 위해 필요한 최소한의 개인정보를 처리합니다. 처리한 개인정보는 아래 목적 이외의 용도로 이용하지 않으며,
            이용 목적이 변경되는 경우 관계 법령에 따라 필요한 조치를 이행합니다.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>회원 가입, 로그인, 본인 계정 식별 및 회원 관리</li>
            <li>라멘 가게 탐색, 추천, 비교, 커뮤니티, 사진 인증 등 서비스 제공</li>
            <li>게시글, 댓글, 사진, 북마크 등 이용자 생성 콘텐츠 관리</li>
            <li>부정 이용 방지, 신고 처리, 서비스 안정성 확보</li>
            <li>문의 대응, 공지 전달, 서비스 품질 개선 및 통계 분석</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-black">2. 처리하는 개인정보 항목</h2>
          <div className="overflow-hidden rounded-sm border border-stone-200">
            <table className="w-full border-collapse text-left text-sm leading-6">
              <thead className="bg-[#f2f2f2] text-[#25282b]">
                <tr>
                  <th className="border-b border-stone-200 px-3 py-2 font-black">구분</th>
                  <th className="border-b border-stone-200 px-3 py-2 font-black">항목</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-b border-stone-200 px-3 py-2 font-bold">OAuth 로그인</td>
                  <td className="border-b border-stone-200 px-3 py-2">로그인 제공자 식별값, 이메일 또는 계정 식별 정보, 프로필 이미지 등 제공자가 전달하는 정보</td>
                </tr>
                <tr>
                  <td className="border-b border-stone-200 px-3 py-2 font-bold">회원 프로필</td>
                  <td className="border-b border-stone-200 px-3 py-2">닉네임, 프로필 이미지, 자기소개 등 회원이 직접 입력하거나 설정한 정보</td>
                </tr>
                <tr>
                  <td className="border-b border-stone-200 px-3 py-2 font-bold">서비스 이용</td>
                  <td className="border-b border-stone-200 px-3 py-2">게시글, 댓글, 사진, 사진 설명, 북마크, 방문·투표·신고 등 서비스 이용 과정에서 생성되는 정보</td>
                </tr>
                <tr>
                  <td className="border-b border-stone-200 px-3 py-2 font-bold">위치 정보</td>
                  <td className="border-b border-stone-200 px-3 py-2">이용자가 기기의 위치 권한을 허용한 경우 현재 위치(위도·경도). 내 주변 매장의 거리 표시, 거리순 정렬, 주변 매장 추천에 사용</td>
                </tr>
                <tr>
                  <td className="border-b border-stone-200 px-3 py-2 font-bold">추천 요청 조건</td>
                  <td className="border-b border-stone-200 px-3 py-2">AI 추천을 요청할 때 고른 국물·분위기·우선순위, 직접 입력한 문장, 지역</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-bold">자동 생성</td>
                  <td className="px-3 py-2">
                    IP 주소, 접속 일시, 브라우저 및 기기 정보, 쿠키, 서비스 이용 기록, 오류 로그, 앱 이용 기록(화면·기능 사용 이벤트,
                    앱 설치 때 만든 임의 기기 식별값, 기기·OS·앱 버전), 앱 오류 정보(오류 내용과 발생 위치, 기기·OS·앱 버전, 앱 설치 때
                    만든 임의 식별값)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3">
            위치 정보는 위치 권한을 허용한 경우에만 수집합니다. 허용하지 않아도 지역을 직접 골라 서비스를 이용할 수 있고, 기기 설정에서 언제든
            권한을 끌 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-black">3. 개인정보의 보유 및 이용 기간</h2>
          <p className="mb-3">
            RAOTA는 개인정보를 수집 및 이용 목적 달성 시까지 보유·이용하며, 회원 탈퇴 또는 삭제 요청 시 30일간 보관 후 파기합니다.
            다만 관계 법령에 따라 보존할 필요가 있거나 분쟁 대응, 부정 이용 방지 등 정당한 사유가 있는 경우 필요한 범위에서 보관할 수 있습니다.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>회원 계정 정보: 회원 탈퇴 요청일로부터 30일 후까지</li>
            <li>소셜 계정, 인증 토큰, 북마크, 인증샷 정보: 회원 탈퇴 요청일로부터 30일 후까지</li>
            <li>
              위치 정보: 매장 조회와 거리 계산에는 요청을 처리하는 데에만 쓰고 별도로 저장하지 않습니다. AI 추천을 요청할 때 보낸 위치는 약 1km
              단위로 낮춘 값만 추천 기록과 함께 저장하며, 회원 탈퇴 요청일로부터 30일 후까지 보관합니다
            </li>
            <li>추천 요청 조건과 추천 결과 기록: 회원 탈퇴 요청일로부터 30일 후까지</li>
            <li>게시글, 댓글 등 커뮤니티 공개 콘텐츠: 서비스 운영상 필요가 종료될 때까지 보관될 수 있으며, 탈퇴 후 작성자 프로필은 탈퇴한 사용자로 익명화</li>
            <li>접속 로그 등 서비스 이용 기록: 보안 및 부정 이용 방지를 위해 필요한 기간</li>
            <li>앱 오류 정보: 수집일로부터 최대 90일</li>
            <li>관계 법령상 보존 의무가 있는 정보: 해당 법령에서 정한 기간</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-black">4. 개인정보의 파기 절차 및 방법</h2>
          <p>
            보유 기간이 경과하거나 처리 목적이 달성된 개인정보는 복구 또는 재생되지 않도록 파기합니다. 전자적 파일은 안전한 방식으로 삭제하고,
            종이 문서가 있는 경우 분쇄 또는 소각 등으로 파기합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-black">5. 개인정보의 제3자 제공</h2>
          <p>
            RAOTA는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만 이용자가 사전에 동의한 경우,
            법령에 특별한 규정이 있는 경우, 수사기관 등 관계 기관의 적법한 요청이 있는 경우에는 필요한 범위에서 제공할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-black">6. 개인정보 처리업무의 위탁</h2>
          <p className="mb-3">RAOTA는 서비스 제공을 위해 다음 업무를 위탁합니다. 국외에 있는 수탁자는 제7조에서 이전 내용을 함께 밝힙니다.</p>
          <LegalTable
            head={['수탁자', '위탁 업무']}
            rows={[
              ['Oracle Corporation (Oracle Cloud Infrastructure, 대한민국 춘천 리전)', '서버·데이터베이스 운영, 앱에서 올린 사진 저장'],
              ['NAVER Cloud Corp.', '앱 지도 표시'],
              ['Cloudflare, Inc.', '사진 전송과 크기 변환'],
              ['Cloudinary Ltd.', '웹에서 올린 사진 저장'],
              ['OpenAI, L.L.C.', 'AI 추천의 매장 검색(요청 조건을 검색용 값으로 변환)'],
              ['Groq, Inc.', 'AI 추천 이유 작성'],
              ['Grafana Labs', '서버 로그 보관과 장애 대응'],
              ['Discord Inc.', '운영 알림(오류, 신고 접수)'],
              ['PostHog, Inc.', '앱 이용 통계'],
              ['Functional Software, Inc. (Sentry)', '앱 오류·충돌 수집과 분석'],
            ]}
          />
          <p className="mt-3">
            위탁한 개인정보는 회원 탈퇴 또는 위탁 계약 종료 시까지 보유하며, 제7조에 따로 정한 기간이 있으면 그에 따릅니다. 수탁자가 바뀌면
            본 처리방침을 통해 알립니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-black">7. 국외 이전</h2>
          <p className="mb-3">
            RAOTA는 서비스 제공을 위해 다음과 같이 개인정보를 국외로 이전합니다. 이전은 서비스를 이용하는 시점에 암호화된 네트워크로
            전송하는 방식으로 이루어집니다.
          </p>
          <LegalTable
            head={['이전받는 자 (국가)', '이전 항목', '목적', '보유 및 이용 기간']}
            rows={[
              ['Cloudflare, Inc. (미국 등 세계 각지)', '사진을 볼 때의 IP 주소, 기기 정보', '사진 전송과 크기 변환', '전송 처리 후 지체 없이 삭제'],
              ['Cloudinary Ltd. (미국)', '웹에서 올린 사진', '사진 저장', '회원 탈퇴 후 30일'],
              ['OpenAI, L.L.C. (미국)', 'AI 추천 요청 조건(국물·분위기·우선순위, 입력한 문장, 지역)', '매장 검색', '처리 후 최대 30일(오남용 확인 목적)'],
              ['Groq, Inc. (미국)', 'AI 추천 요청 조건과 추천 후보 매장 정보', '추천 이유 작성', '처리 후 지체 없이 삭제'],
              ['Grafana Labs (일본)', '서버 로그(회원 ID, IP 주소, 요청 정보, 오류 내용)', '장애 대응과 보안', '수집일로부터 30일'],
              ['Discord Inc. (미국)', '운영 알림에 담긴 회원 ID, 신고 사유, 오류 내용', '운영 알림', '운영자가 알림을 지울 때까지'],
              ['PostHog, Inc. (미국)', '앱 이용 기록(화면·기능 사용 이벤트, 임의 기기 식별값, 기기·OS·앱 버전)', '이용 통계와 서비스 개선', '수집일로부터 1년'],
              ['Functional Software, Inc. (Sentry, 미국)', '앱 오류 정보(오류 내용과 발생 위치, 기기·OS·앱 버전, 임의 설치 식별값)', '앱 오류 확인과 수정', '수집일로부터 최대 90일'],
            ]}
          />
          <p className="mt-3">
            국외 이전을 원하지 않으면 AI 추천 기능을 쓰지 않거나 회원 탈퇴로 거부할 수 있습니다. 이 경우 해당 기능을 이용할 수 없습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-black">8. 정보주체와 법정대리인의 권리·의무 및 행사방법</h2>
          <p className="mb-3">
            이용자는 언제든지 본인의 개인정보에 대해 열람, 정정, 삭제, 처리정지, 동의 철회를 요청할 수 있습니다.
            권리 행사는 서비스 내 기능 또는 contact@raota.net 을 통해 요청할 수 있으며, RAOTA는 본인 확인 후 관계 법령에 따라 처리합니다.
          </p>
          <p>
            개인정보 삭제 요청 시 서비스 제공에 필요한 일부 기능 이용이 제한될 수 있으며, 법령상 보존 의무가 있는 정보는 해당 기간 동안 보관될 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-black">9. 만 14세 미만 아동의 개인정보</h2>
          <p>
            RAOTA는 원칙적으로 만 14세 미만 아동을 대상으로 서비스를 제공하지 않습니다. 만 14세 미만 아동의 개인정보 처리가 필요한 경우
            법정대리인의 동의 등 관계 법령에서 정한 절차를 따릅니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-black">10. 쿠키 등 자동 수집 장치</h2>
          <p className="mb-3">
            RAOTA는 로그인 유지, 보안, 이용 편의, 서비스 품질 개선을 위해 쿠키 또는 이와 유사한 기술을 사용할 수 있습니다.
            이용자는 브라우저 설정을 통해 쿠키 저장을 거부하거나 삭제할 수 있습니다. 다만 쿠키를 제한하는 경우 로그인 등 일부 기능 이용이 어려울 수 있습니다.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Chrome: 설정 &gt; 개인정보 및 보안 &gt; 서드 파티 쿠키 또는 사이트 데이터 관리</li>
            <li>Safari: 설정 &gt; 개인정보 보호 &gt; 쿠키 및 웹사이트 데이터 관리</li>
            <li>Edge: 설정 &gt; 쿠키 및 사이트 권한 &gt; 쿠키 및 사이트 데이터 관리</li>
          </ul>
          <p className="mt-3">
            앱에서는 쿠키 대신 이용 통계 도구(PostHog)로 화면·기능 사용 이벤트를 수집합니다. 앱 설치 때 만든 임의 기기 식별값으로만 묶고
            회원 ID나 이름과 연결하지 않으며, 서비스 개선과 이용 통계에만 사용합니다. 앱에서 오류가 나면 오류 수집 도구(Sentry)로 오류 내용과
            기기·앱 정보를 보냅니다. 회원 ID나 이름과 연결하지 않고 IP 주소는 저장하지 않으며, 오류를 찾아 고치는 데에만 사용합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-black">11. 개인정보의 안전성 확보조치</h2>
          <p>
            RAOTA는 개인정보의 안전한 처리를 위해 접근 권한 관리, 인증 정보 보호, 전송 구간 암호화, 로그 관리,
            보안 업데이트, 비인가 접근 방지 등 합리적인 기술적·관리적 보호조치를 적용합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-black">12. 개인정보 보호책임자 및 문의</h2>
          <p>
            개인정보 처리와 관련한 문의, 권리 행사, 불만 처리, 피해 구제 요청은 아래 연락처로 접수할 수 있습니다.
          </p>
          <p className="mt-3 font-bold">개인정보 문의: contact@raota.net</p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-black">13. 권익침해 구제방법</h2>
          <p className="mb-3">이용자는 개인정보 침해에 대한 상담이나 피해 구제를 위해 아래 기관에 문의할 수 있습니다.</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>개인정보침해신고센터: privacy.kisa.or.kr / 국번 없이 118</li>
            <li>개인정보 분쟁조정위원회: www.kopico.go.kr / 1833-6972</li>
            <li>대검찰청 사이버수사과: www.spo.go.kr / 국번 없이 1301</li>
            <li>경찰청 사이버수사국: ecrm.police.go.kr / 국번 없이 182</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-black">14. 처리방침의 변경</h2>
          <p>
            본 개인정보처리방침은 시행일부터 적용됩니다. 법령, 서비스 내용 또는 개인정보 처리 방식이 변경되는 경우
            개정된 처리방침을 서비스 화면에 게시하고, 중요한 변경은 별도 공지 등 적절한 방법으로 안내합니다.
          </p>
        </section>
      </div>
    </article>
  );
}

/** 열이 셋 이상이면 좁은 화면에서 글자가 한 자씩 끊기지 않게 최소 너비를 두고 가로로 밀어 본다 */
function LegalTable({ head, rows }: { head: string[]; rows: string[][] }) {
  const wide = head.length > 2;
  return (
    <div className="overflow-x-auto rounded-sm border border-stone-200">
      <table className={`w-full border-collapse text-left text-sm leading-6 ${wide ? 'min-w-[40rem]' : ''}`}>
        <thead className="bg-[#f2f2f2] text-[#25282b]">
          <tr>
            {head.map((cell) => (
              <th key={cell} className="border-b border-stone-200 px-3 py-2 font-black">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]}>
              {row.map((cell, index) => (
                <td key={index} className={`border-b border-stone-200 px-3 py-2 ${index === 0 ? 'font-bold' : ''}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
