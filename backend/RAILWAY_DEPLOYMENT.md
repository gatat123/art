# Railway Deployment Guide for Studio Backend

## 환경변수 설정 (Railway Dashboard에서 설정)

Railway 프로젝트 설정에서 다음 환경변수를 추가해야 합니다:

### 필수 환경변수

1. **DATABASE_URL**
   - Railway PostgreSQL 서비스 연결 시 자동으로 생성됨
   - 형식: `postgresql://user:password@host:port/database`

2. **JWT_SECRET**
   - 보안을 위해 강력한 랜덤 문자열 사용
   - 예시: `your-super-secret-jwt-key-2024-production`
   - 생성 방법: `openssl rand -base64 32`

3. **NODE_ENV**
   - 값: `production`

4. **FRONTEND_URL**
   - 값: `https://art-production-a9ab.up.railway.app`

5. **PORT**
   - 값: `3001` (또는 Railway가 자동 할당하는 포트 사용)

6. **ADMIN_USERNAME**
   - 값: `HSG202`

7. **ADMIN_PASSWORD**
   - 값: `1004mobil!#`

8. **ADMIN_EMAIL**
   - 값: `admin@studio.com`

## Railway 배포 단계

1. **PostgreSQL 서비스 추가**
   ```
   Railway Dashboard > New > Database > PostgreSQL
   ```

2. **백엔드 서비스 설정**
   ```
   Railway Dashboard > New > GitHub Repo > gatat123/art
   ```

3. **서비스 설정**
   - Root Directory: `/storyboard-collab/backend`
   - Build Command: `npm install && npm run init-db`
   - Start Command: `npm start`

4. **환경변수 설정**
   - Railway Dashboard > Variables
   - 위의 모든 환경변수 추가

5. **도메인 설정**
   - Railway Dashboard > Settings > Domains
   - Custom domain 또는 Railway 제공 도메인 사용

## 데이터베이스 초기화

첫 배포 시 자동으로 실행됨:
- `npm run init-db` 스크립트가 스키마 생성 및 관리자 계정 생성

## 헬스체크

- 엔드포인트: `/api/health`
- 정상 응답: `{ status: 'OK', message: 'Studio Backend Running' }`

## 로그 확인

Railway Dashboard > Logs에서 실시간 로그 확인 가능

## 문제 해결

1. **데이터베이스 연결 실패**
   - DATABASE_URL 환경변수 확인
   - PostgreSQL 서비스 상태 확인

2. **빌드 실패**
   - package.json 의존성 확인
   - Node.js 버전 호환성 확인

3. **포트 바인딩 실패**
   - PORT 환경변수가 Railway와 일치하는지 확인

## 배포 후 확인사항

1. Health check: `https://your-backend-url.railway.app/api/health`
2. 관리자 로그인 테스트
3. API 엔드포인트 테스트
4. CORS 설정 확인 (프론트엔드와 통신)
