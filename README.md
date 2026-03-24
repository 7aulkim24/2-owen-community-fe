# 커뮤니티 서비스 프론트엔드 (Vanilla JS)

HTML, CSS, Vanilla JS만을 사용하여 구현한 커뮤니티 서비스 프론트엔드입니다.

## 주요 기능
- **회원 인증**: 로그인, 회원가입(프로필 이미지 업로드, 실시간 유효성 검증), 로그아웃 및 세션 관리
- **게시글 관리**: CRUD 기능, **다중 이미지 업로드(최대 5장)**, 좋아요 토글
  - **이미지 캐러셀**: 게시글 상세 페이지에서 다수의 이미지를 탐색할 수 있는 직관적인 슬라이더 UI 제공
  - **무한 스크롤**: `IntersectionObserver` API를 활용한 고성능 스크롤 구현. Sentinel 요소의 DOM 위치 최적화 및 중복 방지 로직으로 안정적인 데이터 로딩 보장.
- **댓글 시스템**: 댓글 작성/수정/삭제 및 작성자 본인 확인 기반의 권한 제어
- **마이페이지**: 프로필 정보(닉네임, 이미지) 수정, 복합 규칙 기반 비밀번호 변경, 회원 탈퇴

## 기술적 특징 및 최적화
- **성능 최적화**: 
  - `esbuild`를 이용한 공통 청크 분리(Shared Chunk Splitting) 및 코드 최소화 (Minification)
  - 이미지 지연 로딩(`loading="lazy"`) 및 정확한 `hasNext` 판별 로직으로 불필요한 네트워크 요청 방지
- **UI/UX**: 
  - 사용자 제공 `favicon.png` 적용으로 브랜드 아이덴티티 강화 (404 에러 해결 및 모든 페이지 일괄 적용)
  - `resetAndReload` 초기화 로직을 통한 매끄러운 UX 제공
  - **반응형 캐러셀**: 모바일/데스크옵 환경에 최적화된 이미지 네비게이션 및 인디케이터 UI
- **안정적인 빌드 시스템**: 
  - `assets` 정적 자산의 중복 복사를 방지하는 클린 빌드 스크립트 적용
  - 소스 경로(`pages/`)와 빌드 경로(`dist/`)의 명확한 분리 및 동기화

## 프로젝트 구조
- **`js/`**: 비즈니스 로직 및 통신 모듈
  - `pages/`: 각 페이지별 독립적 이벤트 핸들러 및 UI 로직
  - `utils/`: 유효성 검사 등 공통 유틸리티 함수
  - `api.js`: fetch API 기반 통합 통신 모듈 및 전역 에러/성공 핸들러
- **`pages/`**: 원본 HTML 템플릿 (auth, posts, profile 하위 구조)
- **`css/`**: 전역 스타일(`common.css`) 및 페이지별 전용 스타일 시트
- **`scripts/`**: `esbuild` 기반의 HTML/CSS/JS 빌드 및 경로 자동화 스크립트
- **`dist/`**: 프로덕션 빌드 결과물 (최소화된 정적 에셋 및 최적화된 경로의 HTML)

## 기술 스택 및 빌드
- **Stack**: HTML, CSS, Vanilla JS (ES6+), **Tailwind CSS v3** (유틸리티 — CDN 미사용)
- **Build**: `tailwindcss` CLI + PostCSS, `esbuild`로 JS·통합 CSS 최소화
- **Tailwind**: `tailwind.config.js` · `css/tailwind.entry.css` — `pages/**/*.html`·`js/**/*.js` 스캔. `preflight: false`로 `common.css`와 충돌 방지.
- **Commands**:
  - `npm run build:prod`: 프로덕션 빌드 (`dist/`, HTML은 `css/style.min.css` 단일 번들)
  - `npm run build`: 개발용 빌드 (`dist/css/tailwind.css` + `common.css` + `pages/*.css`)

## 시작하기
1. **의존성**: 저장소 **루트**(`Prooflog/`) 또는 이 디렉터리에서 `npm install` — 루트에 `package.json`(workspaces)이 있으면 루트에서 한 번만 설치해도 됩니다.
2. **빌드**: `npm run build` 후 **`dist/`에서 정적 서빙** (예: `python3 -m http.server 5500 --directory dist`) — Tailwind는 빌드된 `dist/css/tailwind.css`를 로드합니다.
3. **백엔드**: `http://localhost:8000` 연동 시 루트 `dev.sh` 또는 API 프록시 환경에 맞게 실행
4. **프로덕션 미리보기**: `npm run build:prod` 후 `dist/` 서빙 (CDN Tailwind 경고 없음)

## EC2 배포 요약 (최신)
- API 기본 경로를 절대 URL에서 상대 경로(`/api`) 중심으로 전환했습니다.
- 프론트 Nginx가 `/api` 요청을 백엔드(`:8000`)로 reverse proxy 하도록 구성했습니다.
- 배포 스크립트는 `BACKEND_HOST` 직접 지정 또는 EC2 태그 조회를 지원합니다.
- 상세 절차는 `docs/DEPLOY_QA.md`를 참고하세요.



---
*AWS AI School 2기 과제물*
