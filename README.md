# 커뮤니티 서비스 프론트엔드 (Vanilla JS)

HTML, CSS, Vanilla JS만을 사용하여 구현한 커뮤니티 서비스 프론트엔드입니다.

## 주요 기능
- **회원 인증**: 로그인, 회원가입(프로필 이미지 업로드, 실시간 유효성 검증), 로그아웃 및 세션 관리
- **게시글 관리**: CRUD 기능, 이미지 업로드, 좋아요 토글, `IntersectionObserver` 기반 무한 스크롤
- **댓글 시스템**: 댓글 작성/수정/삭제 및 작성자 본인 확인 기반의 권한 제어
- **마이페이지**: 프로필 정보(닉네임, 이미지) 수정, 복합 규칙 기반 비밀번호 변경, 회원 탈퇴
- **성능 최적화**: `esbuild`를 이용한 공통 청크 분리(Shared Chunk Splitting), 코드 최소화 (Minification), 코드 분리 (Splitting), 번들링 적용, 이미지 지연 로딩(`loading="lazy"`) 추가

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
- **Stack**: HTML, CSS, Vanilla JS (ES6+)
- **Build**: `esbuild` 기반 번들링 및 최소화 (JS/CSS)
- **Commands**:
  - `npm run build:prod`: 프로덕션 빌드 (결과물: `dist/`)
  - `npm run build`: 개발용 빌드 (HTML/CSS 위주)

## 시작하기
1. **백엔드**: `http://localhost:8000`에서 서버 실행 확인
2. **실행**: VS Code **Live Server**로 `pages/auth/login.html` 오픈 (포트 5500 권장)
3. **빌드**: `npm install` 후 `npm run build:prod`로 최적화 결과물 확인 가능

---
*AWS AI School 2기 과제물*
