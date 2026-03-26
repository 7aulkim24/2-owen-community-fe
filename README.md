# Prooflog 프론트엔드

HTML, CSS, Vanilla JS 기반으로 구성된 커뮤니티 및 자동 기록 프론트엔드입니다.  
최근 리팩토링을 통해 공통 보일러플레이트를 제거하고, esbuild 청크 분할 및 리소스 최적화가 적용되었습니다.

## 현재 범위

- 세션 기반 회원 인증 (로그인, 회원가입, 프로필 수정, 파일 업로드)
- 커뮤니티 피드 (IntersectionObserver 무한 스크롤, 게시일/활동일 필터 정렬)
- 게시글 및 댓글 (CRUD, 다중 이미지 캐러셀 UI, URL.createObjectURL 메모리 최적화)
- 외부 연동 관리 (GitHub OAuth 버튼, 즉시 동기화, 수집 통계 제공)
- 자동 로그 워크플로우 (수집 대기 State, 초안 목록, 검토 및 무시 커스텀 모달)

## 구조

- `pages/`: 논리적 폴더 구조로 분리된 원본 HTML 템플릿
- `css/`: Tailwind 설정과 충돌 없는 전역/컴포넌트 단위 Vanilla CSS
- `js/`: 
  - `pages/`: 페이지별 엔트리 포인트 스크립트
  - `utils/`: 공통 로직 (`header-init.js`, `card-builder.js`, `formatting.js`)
  - `api.js`: fetch 기반 중앙 통신 모듈 (요청, 다중 파일 업로드, 통합 에러/토스트 모달 처리)
- `assets/`: 로고, 최적화된 favicon (2KB) 등 정적 파일
- `scripts/`: HTML 경로 변환, esbuild(splitting 적용) 빌드 등 자동화 스크립트
- `dist/`: 프로덕션/개발 빌드 결과물 (배포 대상)

## 기술 스택

- Vanilla JS (ES6+)
- HTML5 / CSS3
- Tailwind CSS v3 (유틸리티)
- esbuild (번들링 및 `--splitting` 모듈 공유 기능 활용)

## 실행

모든 프론트엔드 구동은 워크스페이스 루트의 `dev.sh`를 활용하는 것을 적극 권장합니다.  
단독으로 실행할 경우 아래 절차를 따릅니다.

1. 의존성 설치: `npm install` (루트 워크스페이스 기준)
2. 빌드 실행: 
   - 개발용: `npm run build`
   - 배포용: `npm run build:prod`
3. 서버 구동: 생성된 `dist/` 폴더를 타겟으로 정적 파일 제공  
   (`python3 -m http.server 5500 --directory dist`)
4. 테스트는 `http://localhost:5500` 에서 확인합니다.

*참고*: 브라우저 연동 테스트 시엔 `npm run smoke` (테스트 스크립트) 로그를 확인 가능합니다.

## 핵심 환경 변수

- 필수: 없음 (기본 API 접근 경로는 로컬용 `/api` 로 지정됨)
- 선택: `VITE_API_BASE_URL` (빌드 전 백엔드 주소 오버라이드. 예: `http://localhost:8000`)

## 인증/인가 원칙

- 웹 통신 시 `credentials: 'include'` 설정으로 브라우저 HttpOnly 세션 쿠키를 사용합니다.
- 비로그인 유저가 인증이 필요한 페이지 접근 시 `js/utils/header-init.js` 에서 `/login.html` 로 리다이렉트합니다.
- 백엔드 401/403 응답 수신 시, `api.js` 전역 에러 핸들러가 자동으로 토스트 메시지를 띄우고 세션을 정리합니다.

## 방향

기록 자동화 UX 개선 및 스크립트 구조 안정화를 목표로 합니다.

- Phase 0: 렌더링 성능 최적화 (진행 완료 - 리소스 힌트, 청크 분리, 보일러플레이트 제거)
- Phase 1: GitHub 자동 기록 연동 UI/UX 및 초안 검토 워크플로우 구성 (진행 완료)
- Phase 2 이후: 다중 소스 연동 UI(Notion 등) 확장 및 통계/대시보드 애니메이션 강화
