# Studio Backend - Railway 배포 가이드

## 🚨 중요: 백엔드 별도 배포 필요

현재 백엔드가 프론트엔드와 동일한 서비스에서 실행되고 있어 API 호출이 실패하고 있습니다.

## 🚀 Railway 배포 단계

### 1. 새 Railway 서비스 생성

1. [Railway Dashboard](https://railway.app/dashboard) 접속
2. 프로젝트 선택 (art-production)
3. **New Service** 클릭
4. **Deploy from GitHub repo** 선택
5. Repository: `gatat123/art` 선택
6. **Configure** 클릭

### 2. 서비스 설정

**Service Settings에서:**
- Service Name: `studio-backend`
- Root Directory: `/storyboard-collab/backend`
- Watch Paths: `/storyboard-collab/backend/**`

### 3. 환경변수 설정

**Variables 탭에서 다음 환경변수 추가:**

```bash
# PostgreSQL (자동 연결됨)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# 필수 환경변수
JWT_SECRET=your-super-secret-jwt-key-2024-production
NODE_ENV=production
FRONTEND_URL=https://art-production-a9ab.up.railway.app
PORT=3001

# 관리자 계정
ADMIN_USERNAME=HSG202
ADMIN_PASSWORD=1004mobil!#
ADMIN_EMAIL=admin@studio.com
```

### 4. PostgreSQL 연결

1. 기존 Postgres 서비스 선택
2. **Connect** 클릭
3. `studio-backend` 서비스 선택
4. **Connect Service** 클릭

### 5. 도메인 생성

1. **Settings** → **Networking** → **Generate Domain**
2. 생성된 도메인 복사 (예: `studio-backend-production.up.railway.app`)

### 6. 프론트엔드 환경변수 업데이트

프론트엔드 서비스의 Variables에서:
```bash
NEXT_PUBLIC_API_URL=https://studio-backend-production.up.railway.app/api
```

## 📋 배포 확인

### Health Check
```bash
curl https://[your-backend-domain]/api/health
```

예상 응답:
```json
{
  "status": "OK",
  "message": "Studio Backend Running",
  "timestamp": "2025-08-30T..."
}
```

### 데이터베이스 확인
Railway Postgres 서비스의 Data 탭에서 테이블 생성 확인:
- users
- studios
- projects
- scenes
- images
- comments
- activity_logs

## 🔧 문제 해결

### 1. 빌드 실패
- Node.js 버전 확인 (18.x 필요)
- 의존성 설치 확인

### 2. 데이터베이스 연결 실패
- DATABASE_URL 환경변수 확인
- PostgreSQL 서비스 상태 확인

### 3. 403/CORS 에러
- FRONTEND_URL 환경변수 확인
- CORS 설정 확인

## 📝 로컬 개발

```bash
# 환경변수 설정
cp .env.example .env
# .env 파일 수정

# 의존성 설치
npm install

# 데이터베이스 초기화
npm run init-db

# 개발 서버 실행
npm run dev
```

## 🎯 API 엔드포인트

- POST `/api/auth/register` - 회원가입
- POST `/api/auth/login` - 로그인
- GET `/api/auth/verify` - 토큰 검증
- GET `/api/studios` - 스튜디오 목록
- POST `/api/studios` - 스튜디오 생성
- GET `/api/projects` - 프로젝트 목록
- POST `/api/projects` - 프로젝트 생성
- GET `/api/scenes` - 씬 목록
- POST `/api/scenes` - 씬 생성
- POST `/api/images/upload` - 이미지 업로드
- GET `/api/comments` - 댓글 목록
- POST `/api/comments` - 댓글 생성

---

**마지막 업데이트**: 2025.08.30