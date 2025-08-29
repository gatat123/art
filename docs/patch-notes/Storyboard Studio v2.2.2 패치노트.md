# Studio - 패치노트

## 버전 2.2.2 (2024.12.22) - 긴급 핫픽스

### 🚨 긴급 수정사항

#### 1. ✅ 프로젝트 진입 시 초기화 오류 해결
- **문제**: 프로젝트 생성 후 클릭하여 진입 시 "Cannot access 'Ge' before initialization" 오류 발생
- **원인**: 
  - JavaScript/TypeScript의 변수 호이스팅 문제
  - `addActivity` 함수가 선언되기 전에 `handleSketchUpload`과 `handleArtworkUpload` 함수에서 사용됨
  - 함수 선언 순서 문제로 인한 초기화 오류
- **해결**: 
  - `addActivity` 함수를 파일 상단(95번째 줄 근처)으로 이동
  - `imageLoadError` state 선언 바로 다음에 위치시켜 다른 함수들이 사용하기 전에 초기화 되도록 함
  - 250번째 줄 근처의 중복된 함수 정의 제거
- **결과**: 프로젝트 진입 시 정상 작동

---

### 🔧 기술적 세부사항

#### 수정된 파일
- `src/components/SceneView.tsx`
  - 함수 선언 순서 재정렬
  - 중복 코드 제거
  - 종속성 문제 해결

#### 수정 전후 비교
**수정 전**:
```typescript
// 96번째 줄
const [imageLoadError, setImageLoadError] = useState<{[key: string]: boolean}>({});

// useComments 훅 사용
const { ... } = useComments(propsComments);

// ... 많은 코드들 ...

// 240번째 줄 - 너무 늦게 정의됨
const addActivity = useCallback((type: string, content: string) => {
  // ...
}, []);
```

**수정 후**:
```typescript
// 96번째 줄
const [imageLoadError, setImageLoadError] = useState<{[key: string]: boolean}>({});

// 활동 로그 추가 함수 - 다른 함수들보다 먼저 정의
const addActivity = useCallback((type: string, content: string) => {
  const activity = {
    id: Date.now(),
    type,
    user: '나',
    time: new Date().toLocaleString('ko-KR'),
    content
  };
  setActivityLog(prev => [activity, ...prev]);
}, []);

// useComments 훅 사용
const { ... } = useComments(propsComments);
```

---

### ⚡ 성능 영향
- 코드 실행 순서 최적화로 초기 로딩 속도 개선
- 불필요한 재선언 제거로 메모리 사용량 감소

---

### 🐛 해결된 문제
- ✅ ReferenceError: Cannot access 'Ge' before initialization
- ✅ 프로젝트 진입 불가 문제
- ✅ 초기화 순서 문제로 인한 런타임 오류

---

### 📝 개발자 참고사항

#### JavaScript/TypeScript 초기화 순서
JavaScript에서는 변수나 함수가 선언되기 전에 사용할 수 없습니다. 특히 `const`로 선언된 함수는 호이스팅되지 않으므로 사용하기 전에 반드시 선언되어야 합니다.

**올바른 패턴**:
```typescript
// 1. 의존성이 없는 함수/변수 먼저 선언
const helperFunction = () => { ... };

// 2. 의존성이 있는 함수는 그 다음에 선언
const mainFunction = () => {
  helperFunction(); // OK
};
```

---

### 🚨 중요 공지

이번 버그는 함수 선언 순서를 고려하지 않아 발생한 초급 실수였습니다. 
앞으로는 다음과 같은 코딩 규칙을 준수하겠습니다:

1. **선언 순서 규칙**: 의존성을 가진 함수는 의존하는 함수보다 나중에 선언
2. **즉시 테스트**: 코드 변경 후 기본 기능 테스트 필수
3. **린트 규칙 강화**: ESLint 규칙에 초기화 순서 체크 추가

---

### 🔄 다음 업데이트 예정 (v2.3.0)
- [ ] 실시간 협업 기능 (WebSocket)
- [ ] 버전 간 비교 기능
- [ ] 버전 복원 기능
- [ ] 댓글 알림 시스템
- [ ] 자동 저장 기능
- [ ] 드래그 앤 드롭 파일 업로드
- [ ] TypeScript strict 모드 활성화

---

### 🙏 감사의 말

치명적인 버그를 빠르게 발견하고 보고해 주셔서 감사합니다.
이런 기본적인 실수로 불편을 끼쳐드려 죄송합니다.

---

## 이전 버전 히스토리

### 버전 2.2.1 (2024.12.20)
- 주석 저장 후 댓글 표시
- 댓글 입력란 위치 개선
- 활동 기록 표시 구현
- 초안 직접그리기 저장 기능
- 재업로드 플로우 추가
- 씬 설명 편집 기능

### 버전 2.2.0 (2024.12.20)
- React 성능 최적화
- 컴포넌트 모듈화
- 키보드 단축키 추가
- 에러 처리 강화

### 버전 2.1.0 (2024.12.20)
- 버전 히스토리 관리
- 비교 모드 주석 숨김
- 초대코드 시스템
- 어드민 계정 추가

### 버전 2.0.0 (2024.12.20)
- 주석 그리기 기능
- 씬 추가 기능
- 워크플로우 개선

---

**Last Updated**: 2024.12.22  
**Current Version**: 2.2.2  
**Status**: Production Ready 🚀  
**GitHub Repository**: https://github.com/gatat123/art  
**Production URL**: https://art-production-a9ab.up.railway.app/

---

### 📞 문의사항

프로젝트 관련 문의사항이나 추가 버그 리포트는 GitHub Issues를 통해 제출해주세요.

---

**© 2024 Studio. All rights reserved.**