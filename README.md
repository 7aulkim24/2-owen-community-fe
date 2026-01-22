# AWS AI School 2기 Frontend

AWS AI School 2기 김은수 - 커뮤니티 서비스 프론트엔드 구현 과제입니다.

## 프로젝트 개요
커뮤니티 서비스의 프론트엔드 기능을 HTML, CSS, Vanilla JavaScript만을 사용하여 구현하였습니다.

## 기술 스택
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Styling**: Flexbox, CSS Grid, 반응형 디자인
- **Architecture**: 컴포넌트 기반 모듈화 구조

## 주요 구현 기능

### 1. 회원가입 및 로그인
- **로그인**: 이메일/비밀번호 유효성 검사 및 페이지 이동
- **회원가입**: 프로필 이미지 업로드, 실시간 유효성 검사, 비밀번호 확인

### 2. 게시글 관리
- **목록 조회**: 카드 레이아웃, 무한 스크롤, 통계 포맷팅 (1k 등)
- **게시글 작성**: 제목/내용/이미지 입력, 실시간 유효성 검사
- **게시글 수정**: 기존 데이터 로드, 수정 폼 제공

### 3. 게시글 상세 및 댓글
- **상세 조회**: 게시글 정보 표시, 좋아요/통계 기능, 수정/삭제 버튼
- **댓글 시스템**: 목록 조회, 작성/수정/삭제 기능, 실시간 버튼 제어

### 4. 회원정보 관리
- **프로필 수정**: 이미지 변경, 닉네임 유효성 검사, 회원 탈퇴
- **비밀번호 수정**: 복합 규칙 검사, 일치 여부 확인, 토스트 알림

### 5. UI/UX 컴포넌트
- **헤더 네비게이션**: 통일된 레이아웃, 프로필 드롭다운 메뉴
- **인터랙션 요소**: 토스트 메시지, 모달, 반응형 디자인, 상태 시각화

## 폴더 구조
- `css/`:
  - `common.css`: 공통 스타일 및 컴포넌트 정의
  - `pages/`: 페이지별 고유 스타일 (`login.css`, `signup.css`, `posts.css`, `post-detail.css`, `make-post.css`, `edit-post.css`, `edit-profile.css`, `edit-password.css`)
- `js/`:
  - `api.js`: fetch API를 활용한 통신 모듈
  - `pages/`: 각 페이지별 비즈니스 로직 (`login.js`, `signup.js`, `posts.js`, `post-detail.js`, `make-post.js`, `edit-post.js`, `edit-profile.js`, `edit-password.js`)
  - `utils/`: 유효성 검사 등 공통 유틸리티 함수 (`validation.js`)
- `*.html`: 각 페이지별 마크업 파일 (`login.html`, `signup.html`, `posts.html`, `post-detail.html`, `make-post.html`, `edit-post.html`, `edit-profile.html`, `edit-password.html`)
- `build-css.sh`: CSS 빌드 스크립트
- `package.json`: 프로젝트 설정 및 의존성 관리

## 프로젝트 특징
- **순수 Vanilla JS**: 외부 라이브러리 의존성 없이 구현
- **모듈화 구조**: CSS, JS 파일의 체계적 분리 및 관리
- **반응형 디자인**: 모바일 및 데스크톱 환경 최적화
- **접근성 고려**: 시맨틱 HTML, 키보드 내비게이션 지원
- **사용자 경험**: 실시간 유효성 검사, 직관적인 인터랙션

## 향후 개선사항
- 실제 백엔드 API 연동
- 사용자 인증 시스템 구현
