# AWS AI School 2기 Frontend

AWS AI School 2기 김은수 - 커뮤니티 서비스 프론트엔드 구현 과제입니다.

## 프로젝트 개요
커뮤니티 서비스의 프론트엔드 기능을 HTML, CSS, Vanilla JavaScript만을 사용하여 구현하였습니다.

## 기술 스택
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Styling**: Flexbox, CSS Grid, 반응형 디자인
- **Architecture**: 컴포넌트 기반 모듈화 구조
- **Build System**: 자동화된 HTML/CSS 경로 관리, 환경 변수 지원
- **API Integration**: 유연한 환경별 API 엔드포인트 설정

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

### 6. API 통신 및 에러 처리
- **표준 응답 규격**: `{ code, data, message: "" }` 구조의 백엔드 응답 처리
- **책임 분리**: 백엔드는 에러 코드만 전달하며, 모든 한글 메시지는 프론트엔드(`js/error-messages.js`)에서 매핑 관리
- **출처 기반 메시징**: API 호출 시 성공 메시지를 직접 지정 가능 (`handleApiSuccess`)
- **자동 인증 처리**: 세션 만료(`UNAUTHORIZED`) 시 자동으로 로그인 페이지 리다이렉트

## 폴더 구조
- `pages/`:
  - `auth/`: 인증 관련 페이지 (`login.html`, `signup.html`)
  - `posts/`: 게시글 관련 페이지 (`list.html`, `detail.html`, `create.html`, `edit.html`)
  - `profile/`: 프로필 관리 페이지 (`edit-profile.html`, `edit-password.html`)
- `css/`:
  - `common.css`: 공통 스타일 및 컴포넌트 정의
  - `pages/`: 페이지별 고유 스타일 (`login.css`, `signup.css`, `posts.css`, `post-detail.css`, `make-post.css`, `edit-post.css`, `edit-profile.css`, `edit-password.css`)
- `js/`:
  - `api.js`: fetch API를 활용한 통신 및 공통 에러/성공 처리 모듈
  - `error-messages.js`: 백엔드 코드별 한글 메시지 매핑 데이터
  - `pages/`: 각 페이지별 비즈니스 로직 (`login.js`, `signup.js`, `posts.js`, `post-detail.js`, `make-post.js`, `edit-post.js`, `edit-profile.js`, `edit-password.js`)
  - `utils/`: 유효성 검사 등 공통 유틸리티 함수 (`validation.js`)
- `build-css.sh`: CSS 빌드 스크립트
- `build-html.sh`: HTML 파일 배포용 복사 스크립트
- `package.json`: 프로젝트 설정 및 의존성 관리

## 개발 워크플로우

### 개발 시
1. `pages/` 디렉토리의 HTML 파일들을 직접 편집
2. CSS와 JS 파일들은 기존 구조에서 작업
3. 로컬 서버에서 `pages/` 내 파일들로 테스트

### 배포 시
1. `./build-html.sh` 실행하여 루트 디렉토리에 HTML 파일 생성
2. 기존 URL 구조 유지됨
3. `./build-css.sh` 실행하여 CSS 번들링 (선택사항)

### 주의사항
- 루트 디렉토리의 HTML 파일들은 빌드 출력물로 `.gitignore`에 포함됨
- 개발 시에는 `pages/`의 파일들만 편집

## 프로젝트 특징
- **에러 코드 기반 메시지 관리**: 백엔드와 프론트엔드의 책임을 명확히 분리하여 유지보수성 향상
- **순수 Vanilla JS**: 외부 라이브러리 의존성 없이 구현
- **모듈화 구조**: CSS, JS 파일의 체계적 분리 및 관리
- **반응형 디자인**: 모바일 및 데스크톱 환경 최적화
- **접근성 고려**: 시맨틱 HTML, 키보드 내비게이션 지원
- **사용자 경험**: 실시간 유효성 검사, 직관적인 인터랙션
- **구조화된 빌드 프로세스**: 자동화된 HTML 파일 생성 및 경로 관리
- **환경별 설정 지원**: API 엔드포인트의 유연한 환경 변수 구성

## 향후 개선사항
- 게시글 및 댓글 기능의 백엔드 연동 심화 (현재 더미 데이터 혼용)
- 프로덕션 보안 강화 (CSP, HTTPS, 입력 검증 강화)
