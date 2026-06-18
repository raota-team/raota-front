# 라멘로그 백엔드 API 명세 초안

## 1. 목적

현재 프론트엔드에 더미 데이터와 로컬 상태로 구현된 라멘로그 기능을 실제 API로 전환하기 위한 명세다.

필요 기능:

- 공개 라멘로그 피드
- 6개 단위 페이지네이션 및 무한스크롤
- 가게·키워드 필터와 최신순·인기순 정렬
- 라멘로그 작성, 수정, 삭제
- 공개·비공개 설정
- 좋아요 토글
- 마이페이지 내 로그 및 타 사용자 공개 로그
- 가게 상세에서 해당 가게가 선택된 상태로 라멘로그 작성

조회수는 현재 프론트엔드 범위에 포함하지 않는다.

## 2. 기존 인증샷 API와의 관계

현재 프론트엔드는 `/users/me/photos`, `/users/{userId}/photos` 응답을 마이페이지 로그처럼 사용하고 있다.

라멘로그는 인증샷보다 데이터가 많으므로 별도 리소스로 분리하는 것을 권장한다.

- 신규 리소스: `/ramen-logs`
- 신규 사용자 목록: `/users/me/ramen-logs`, `/users/{userId}/ramen-logs`
- 기존 `/photos` API는 기존 인증샷 호환을 위해 유지 가능
- 프로필 통계는 `total_log_count`를 신규 제공
- 전환 기간에는 `total_photo_count`와 `total_log_count`를 함께 제공해도 됨

## 3. 공통 응답 형식

기존 API 응답 형식을 따른다.

```json
{
  "status": "SUCCESS",
  "message": "성공",
  "data": {}
}
```

페이지 응답:

```json
{
  "status": "SUCCESS",
  "message": "성공",
  "data": {
    "items": [],
    "page": {
      "number": 0,
      "size": 6,
      "totalElements": 24,
      "totalPages": 4,
      "hasNext": true,
      "hasPrevious": false
    }
  }
}
```

프론트엔드는 기본 `size=6`을 사용한다.

## 4. 데이터 모델

### 4.1 라멘로그 응답

```json
{
  "id": 101,
  "author": {
    "id": 12,
    "name": "멘마수집가",
    "imageUrl": "https://..."
  },
  "shop": {
    "id": 1,
    "name": "멘야 하루",
    "location": "서울 마포구"
  },
  "menuName": "특제 돈코츠 라멘",
  "ramenType": "돈코츠",
  "imageUrl": "https://...",
  "createdAt": "2026-06-18T12:30:00+09:00",
  "note": "기름진데 끝맛이 둔하지 않아서 좋았다.",
  "tasteNotes": {
    "broth": ["진해요", "감칠맛 좋아요"],
    "noodle": ["단단해요"],
    "seasoning": ["딱 좋아요"],
    "topping": ["차슈 좋아요", "구성 알차요"]
  },
  "revisit": "DEFINITELY",
  "likeCount": 38,
  "liked": false,
  "public": true,
  "mine": false
}
```

필드 규칙:

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `id` | number | Y | 라멘로그 ID |
| `author` | object | Y | 작성자 요약 정보 |
| `shop` | object | Y | 연결 가게 정보 |
| `shop.id` | number | Y | 가게 ID |
| `menuName` | string | Y | 먹은 메뉴 이름 |
| `ramenType` | string | Y | 돈코츠, 쇼유, 시오 등 |
| `imageUrl` | string | Y | 기존 파일 업로드 완료 URL |
| `createdAt` | datetime | Y | 작성 일시 |
| `note` | string | N | 최대 200자 |
| `tasteNotes` | object | Y | 항목별 선택 태그, 미선택 시 빈 배열 |
| `revisit` | enum | Y | 재방문 의사 |
| `likeCount` | number | Y | 좋아요 수 |
| `liked` | boolean | Y | 현재 로그인 사용자의 좋아요 여부, 비로그인은 `false` |
| `public` | boolean | Y | 공개 여부 |
| `mine` | boolean | Y | 현재 로그인 사용자가 작성자인지 여부 |

프론트 연동 시 현재 화면 모델과의 매핑:

| API 필드 | 현재 프론트 필드 |
| --- | --- |
| `createdAt` | `date` |
| `likeCount` | `likes` |
| `liked` | `isLiked` |
| `public` | `isPublic` |

API 필드명을 위 형식으로 확정하면 프론트 API 계층에서 한 번 정규화한다.

### 4.2 재방문 의사 enum

| 코드 | 화면 문구 |
| --- | --- |
| `DEFINITELY` | 자주 감 |
| `SOMETIMES` | 가끔 생각남 |
| `ONCE_ENOUGH` | 한번이면 충분 |

### 4.3 취향 항목

```json
{
  "broth": [],
  "noodle": [],
  "seasoning": [],
  "topping": []
}
```

초기 버전은 선택값을 문자열 배열로 저장해도 된다. 추후 통계 활용이 필요하면 별도 코드 테이블로 분리할 수 있다.

## 5. API

### 5.1 공개 라멘로그 목록

```http
GET /ramen-logs?page=0&size=6&sort=LATEST&shopId=1&keyword=돈코츠
```

인증:

- 비로그인 조회 가능
- 비공개 로그 제외
- 로그인 시 각 항목의 `liked`, `mine` 계산

Query:

| 이름 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `page` | number | `0` | 0부터 시작 |
| `size` | number | `6` | 프론트 기본 6 |
| `sort` | enum | `LATEST` | `LATEST`, `POPULAR` |
| `shopId` | number | - | 가게별 필터 |
| `keyword` | string | - | 가게명, 메뉴명, 라멘 타입, 기록 내용 검색 |

정렬:

- `LATEST`: `createdAt DESC`
- `POPULAR`: `likeCount DESC`, 동률이면 `createdAt DESC`

응답: `PageResponse<RamenLogResponse>`

### 5.2 라멘로그 상세

```http
GET /ramen-logs/{logId}
```

- 공개 로그는 누구나 조회 가능
- 비공개 로그는 작성자만 조회 가능
- 목록 응답에 상세 정보가 모두 포함된다면 초기 프론트 연동에서 생략 가능

### 5.3 라멘로그 작성

```http
POST /ramen-logs
Authorization: Bearer {token}
Content-Type: application/json
```

이미지는 기존 파일 업로드 티켓으로 먼저 업로드한 뒤 URL을 전달한다.

```json
{
  "shopId": 1,
  "menuName": "특제 돈코츠 라멘",
  "ramenType": "돈코츠",
  "imageUrl": "https://...",
  "note": "다음에는 면을 단단하게 주문해보기",
  "tasteNotes": {
    "broth": ["진해요"],
    "noodle": ["단단해요"],
    "seasoning": ["딱 좋아요"],
    "topping": ["차슈 좋아요"]
  },
  "revisit": "DEFINITELY",
  "public": true
}
```

검증:

- 로그인 필수
- `shopId`, `menuName`, `ramenType`, `imageUrl`, `revisit`, `public` 필수
- `note` 최대 200자
- 존재하지 않는 `shopId`는 404 또는 400
- 취향 배열은 미입력 시 빈 배열로 정규화

응답: 생성된 `RamenLogResponse`

### 5.4 라멘로그 수정

```http
PATCH /ramen-logs/{logId}
Authorization: Bearer {token}
Content-Type: application/json
```

요청 형식은 작성과 동일하다.

- 작성자만 수정 가능
- 기존 이미지를 유지할 때 기존 `imageUrl` 재전달 가능
- 수정 시간 `updatedAt` 저장 권장

응답: 수정된 `RamenLogResponse`

### 5.5 라멘로그 삭제

```http
DELETE /ramen-logs/{logId}
Authorization: Bearer {token}
```

- 작성자만 삭제 가능
- 소프트 삭제 권장
- 연결된 좋아요는 조회에서 제외하거나 함께 정리

응답:

```json
{
  "status": "SUCCESS",
  "message": "라멘로그가 삭제되었습니다.",
  "data": null
}
```

### 5.6 좋아요 토글

```http
POST /ramen-logs/{logId}/likes
Authorization: Bearer {token}
```

동일 엔드포인트 호출로 좋아요와 취소를 토글한다.

```json
{
  "status": "SUCCESS",
  "message": "성공",
  "data": {
    "liked": true,
    "likeCount": 39
  }
}
```

규칙:

- 로그인 필수
- 사용자와 로그 조합은 unique
- 응답에 변경 후 `liked`, `likeCount`를 모두 반환
- 비공개 로그는 작성자 외 좋아요 불가

### 5.7 내 라멘로그 목록

```http
GET /users/me/ramen-logs?page=0&size=6&shopId=1
Authorization: Bearer {token}
```

- 공개·비공개 로그 모두 반환
- 최신순 기본
- `shopId` 필터 지원
- 마이페이지 무한스크롤에서 6개 단위 호출

응답: `PageResponse<RamenLogResponse>`

### 5.8 사용자 라멘로그 목록

```http
GET /users/{userId}/ramen-logs?page=0&size=6&shopId=1
```

- 해당 사용자의 공개 로그만 반환
- 차단·탈퇴·존재하지 않는 사용자 정책은 기존 프로필 API를 따름
- `shopId` 필터 지원

응답: `PageResponse<RamenLogResponse>`

### 5.9 사용자 로그 가게 필터 목록

현재 프론트는 방문기록 API를 호출해 드롭다운 목록을 만들고 있다. 하지만 방문했어도 로그가 없는 가게가 노출될 수 있으므로 아래 API를 권장한다.

```http
GET /users/me/ramen-logs/shops
GET /users/{userId}/ramen-logs/shops
```

응답:

```json
{
  "status": "SUCCESS",
  "message": "성공",
  "data": [
    {
      "id": 1,
      "name": "멘야 하루",
      "logCount": 3
    }
  ]
}
```

우선 구현에서 생략할 경우 기존 방문기록 목록으로 대체 가능하다.

## 6. 프로필 통계 변경

`GET /users/me/profile`, `GET /users/{userId}/profile`의 `stats`에 아래 필드를 추가한다.

```json
{
  "total_log_count": 12
}
```

전환 기간 호환 예시:

```json
{
  "visited_restaurant_count": 5,
  "total_photo_count": 12,
  "total_log_count": 12,
  "total_bookmark_count": 4,
  "post_count": 3,
  "comment_count": 8
}
```

## 7. 권한과 노출 규칙

| 기능 | 비로그인 | 로그인 사용자 | 작성자 |
| --- | --- | --- | --- |
| 공개 목록 조회 | 가능 | 가능 | 가능 |
| 비공개 로그 조회 | 불가 | 불가 | 가능 |
| 작성 | 불가 | 가능 | 가능 |
| 수정 | 불가 | 불가 | 가능 |
| 삭제 | 불가 | 불가 | 가능 |
| 좋아요 | 불가 | 가능 | 가능 |

프론트는 `mine=true`인 경우에만 상세 모달 우측 상단에 수정·삭제 버튼을 노출한다. 서버 권한 검증은 별도로 반드시 수행해야 한다.

## 8. 권장 테이블 구조

### `ramen_log`

- `id`
- `member_id`
- `ramen_shop_id`
- `menu_name`
- `ramen_type`
- `image_url`
- `note` (`varchar(200)`)
- `broth_notes` 또는 취향 JSON
- `noodle_notes`
- `seasoning_notes`
- `topping_notes`
- `revisit`
- `is_public`
- `created_at`
- `updated_at`
- `deleted_at`

취향 정보를 JSON 컬럼 하나로 저장하는 경우:

```json
{
  "broth": [],
  "noodle": [],
  "seasoning": [],
  "topping": []
}
```

### `ramen_log_like`

- `id`
- `ramen_log_id`
- `member_id`
- `created_at`
- unique: `(ramen_log_id, member_id)`

## 9. 에러 처리

| 상황 | HTTP |
| --- | --- |
| 인증 필요 | 401 |
| 본인 로그가 아닌 수정·삭제 | 403 |
| 비공개 로그 접근 | 403 또는 존재 은닉을 위한 404 |
| 로그·가게 없음 | 404 |
| 200자 초과, 잘못된 enum | 400 |
| 중복 좋아요 경합 | 트랜잭션 처리 후 정상 토글 결과 반환 |

## 10. 구현 우선순위

1. 라멘로그 테이블 및 CRUD
2. 공개 목록 6개 페이지네이션
3. 내 로그·사용자 로그 목록
4. 좋아요 토글 및 인기순
5. `shopId`, `keyword` 필터
6. 프로필 `total_log_count`
7. 사용자별 로그 가게 목록 API

## 11. 프론트 연동 완료 조건

- 더미 `seedLogs` 제거
- 공개 목록을 `GET /ramen-logs?size=6`으로 교체
- 작성·수정·삭제 후 목록 캐시 갱신
- 좋아요 토글 응답으로 카드 수치 즉시 갱신
- 마이페이지 `/photos` 호출을 `/ramen-logs` 호출로 교체
- 비공개 로그는 내 로그에서만 확인 가능
- 가게 상세에서 전달한 `shopId`로 작성 성공
- 6개 단위 무한스크롤의 `hasNext` 종료 처리
