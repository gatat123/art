# Studio Backend API - 패치노트

## 버전 2.3.0 (2025.08.30) - 댓글 시스템 개선

### 🚀 백엔드 API 기능 추가

#### 1. 댓글 테이블 스키마 개선
- **추가된 필드**:
  - `annotation_data` (TEXT): 주석 그리기 데이터 저장
  - `image_type` (VARCHAR(50)): 주석이 적용된 이미지 타입 (draft/artwork)
  - `tag` (VARCHAR(50)): 댓글 태그 (수정요청 등)
  - `resolved` (BOOLEAN): 댓글 해결 상태 관리
- **인덱스 추가**: tag와 resolved 필드에 인덱스 생성으로 검색 성능 향상

#### 2. 댓글 API 엔드포인트 추가 및 개선

##### 새로운 엔드포인트
- **GET /api/comments?scene_id=:id**
  - 특정 씬의 댓글 목록 조회
  - 사용자 정보 포함 (username, avatar_url)
  - 생성 시간 역순 정렬

- **PATCH /api/comments/:id/resolve**
  - 댓글 해결 상태 토글
  - 현재 상태를 확인 후 반대 상태로 변경

##### 기존 엔드포인트 개선
- **POST /api/comments**
  - 새 필드 처리 추가: annotation_data, image_type, tag
  - 활동 로그에 주석 존재 여부 기록

- **PUT /api/comments/:id**
  - content, resolved, tag 필드 개별 수정 가능
  - 동적 쿼리 생성으로 필요한 필드만 업데이트

#### 3. 사용자 API 기능 추가
- **PATCH /api/users/profile**
  - 사용자 프로필 업데이트 (username, email, avatar_url)
  - 중복 체크 및 에러 처리 포함

### 🔧 기술적 개선사항

#### 데이터베이스
- 마이그레이션 시스템 구축 (db/migrations 폴더)
- schema.sql 업데이트로 새 테이블 구조 반영

#### API 응답 개선
- 모든 댓글 관련 API가 사용자 정보를 포함하여 반환
- 일관된 에러 메시지 형식

### 📊 영향 범위
- 프론트엔드의 주석 기능과 완벽한 호환성
- 수정요청 태그 기능 지원
- 댓글 해결 상태 추적 가능

### 🛠️ 마이그레이션 가이드

1. 데이터베이스 마이그레이션 실행:
```bash
cd backend
npm run migrate
```

2. 서버 재시작:
```bash
npm run dev
```

### 🐛 알려진 이슈
- 없음

### 📝 API 사용 예시

#### 씬별 댓글 조회
```bash
GET /api/comments?scene_id=1
Authorization: Bearer <token>
```

#### 주석이 포함된 댓글 생성
```json
POST /api/comments
{
  "scene_id": 1,
  "content": "주석을 추가했습니다",
  "annotation_data": "<base64-encoded-image>",
  "image_type": "draft",
  "tag": "수정요청"
}
```

#### 댓글 해결 상태 변경
```bash
PATCH /api/comments/1/resolve
Authorization: Bearer <token>
```

---

**Last Updated**: 2025.08.30  
**Current Version**: 2.3.0  
**Status**: Production Ready 🚀  
**GitHub Repository**: https://github.com/gatat123/art

---

**© 2025 Studio. All rights reserved.**
