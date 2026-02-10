# RAOTA - 라멘 맛집 리뷰 플랫폼

Next.js App Router + TypeScript + Tailwind CSS 기반의 라멘 맛집 리뷰 플랫폼입니다.

## 🚀 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Lucide React Icons
- **Rich Text Editor**: Tiptap
- **Carousel**: Swiper
- **Animation**: Framer Motion

## 📦 설치 및 실행

### 개발 모드

```bash
npm install
npm run dev
```

개발 서버는 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

### 프로덕션 빌드

```bash
npm run build
npm start
```

## 📁 프로젝트 구조

```
raota-front-main/
├── app/                      # Next.js App Router
│   ├── components/          # 재사용 가능한 컴포넌트
│   ├── context/             # React Context (전역 상태 관리)
│   ├── lib/                 # 유틸리티 및 데이터
│   ├── types/               # TypeScript 타입 정의
│   ├── shop/[id]/           # 가게 상세 페이지 (동적 라우트)
│   ├── shops/               # 가게 목록 페이지
│   ├── community/           # 커뮤니티 페이지
│   │   ├── [id]/           # 게시글 상세 (동적 라우트)
│   │   └── write/          # 글쓰기 페이지
│   ├── mypage/              # 마이페이지
│   ├── login/               # 로그인 페이지
│   ├── user/[username]/     # 유저 프로필 (동적 라우트)
│   ├── layout.tsx           # 루트 레이아웃
│   ├── page.tsx             # 홈 페이지
│   └── globals.css          # 전역 스타일
├── public/                   # 정적 파일
├── next.config.ts           # Next.js 설정
├── tailwind.config.js       # Tailwind CSS 설정
├── tsconfig.json            # TypeScript 설정
└── package.json             # 프로젝트 의존성

```

## 🎨 주요 기능

### 1. 홈 페이지
- 풀스크린 히어로 섹션
- 라멘 맛집 소개

### 2. 가게 목록 (`/shops`)
- 지역별, 라멘 종류별 필터링
- 검색 기능
- 정렬 기능 (기본/이름순/인기순)

### 3. 가게 상세 (`/shop/[id]`)
- 에디터 리뷰
- 메뉴 정보
- 베스트 메뉴 투표
- 방문 인증 사진
- 가게 정보 (영업시간, 위치 등)

### 4. 커뮤니티 (`/community`)
- 카테고리별 게시글 (맛집후기, 꿀팁, Q&A, 자유게시판)
- 검색 및 필터링
- 인기글 모아보기

### 5. 마이페이지 (`/mypage`)
- 사용자 프로필
- 업로드한 사진
- 방문한 가게
- 북마크

## 🎯 마이그레이션 완료 내역

이 프로젝트는 **React + Vite**에서 **Next.js App Router + TypeScript + Tailwind CSS**로 마이그레이션되었습니다.

### 주요 변경사항

1. ✅ **React Router → Next.js App Router**
   - `react-router-dom` 제거
   - Next.js 파일 기반 라우팅 적용
   - 동적 라우트 구현 (`[id]`, `[username]`)

2. ✅ **JavaScript → TypeScript**
   - 모든 컴포넌트를 TypeScript로 변환
   - 타입 정의 추가 (`app/types/index.ts`)
   - 완전한 타입 안전성 확보

3. ✅ **Vite → Next.js**
   - Vite 설정 파일 제거
   - Next.js 설정으로 전환
   - `index.html` 제거 (App Router 사용)

4. ✅ **클라이언트 상태 관리**
   - React Context API 사용
   - `useApp` 훅으로 전역 상태 접근
   - 서버/클라이언트 컴포넌트 분리

5. ✅ **Tailwind CSS 유지**
   - 기존 스타일 그대로 유지
   - Next.js에 맞게 설정 조정

## 📝 개발 가이드

### 새로운 페이지 추가

1. `app` 폴더에 새 디렉토리 생성
2. `page.tsx` 파일 생성
3. 컴포넌트 export

```typescript
// app/example/page.tsx
export default function ExamplePage() {
  return <div>Example Page</div>;
}
```

### 동적 라우트 추가

```typescript
// app/blog/[slug]/page.tsx
export default function BlogPost({ params }: { params: { slug: string } }) {
  return <div>Post: {params.slug}</div>;
}
```

### 전역 상태 사용

```typescript
'use client';

import { useApp } from '@/app/context/AppContext';

export default function MyComponent() {
  const { shops, isLoggedIn, handleLogin } = useApp();
  // ...
}
```

## 🔧 추가 개선 가능 사항

- [ ] API 라우트 추가 (`app/api/`)
- [ ] 서버 컴포넌트 최적화
- [ ] 이미지 최적화 (Next.js Image 컴포넌트)
- [ ] SEO 메타데이터 개선
- [ ] 에러 처리 (`error.tsx`, `not-found.tsx`)
- [ ] 로딩 상태 개선 (`loading.tsx`)
- [ ] 데이터베이스 연동
- [ ] 인증 시스템 구현

## 📄 라이선스

MIT License

## 👥 기여

프로젝트 기여는 언제나 환영합니다!
