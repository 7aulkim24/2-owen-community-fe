# AWS AI School 2기 Frontend

AWS AI School 2기 김은수 - 커뮤니티 서비스 프론트엔드 구현 과제입니다.

## 프로젝트 개요
커뮤니티 서비스의 프론트엔드 기능을 HTML, CSS, Vanilla JavaScript만을 사용하여 구현하였습니다. 백엔드 API와 연동하여 실시간 데이터 처리 및 사용자 인터랙션을 제공합니다.

## 기술 스택
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Styling**: Flexbox, CSS Grid, 반응형 디자인 (Mobile & Desktop)
- **Architecture**: 컴포넌트 기반 모듈화 구조, 전역 상태 관리(LocalStorage)
- **API Integration**: fetch API 기반 통합 통신 모듈 (`api.js`)
- **Build System**: HTML/CSS/JS 경로 관리, CSS 번들·최소화, JS 번들링 (esbuild), 프로덕션 빌드 분리 (`npm run build` / `npm run build:prod`)

## 주요 구현 기능

### 1. 회원 인증 시스템
- **로그인**: 이메일/비밀번호 유효성 검사 및 API 연동, 세션 유지(Cookie 기반)
- **회원가입**: 프로필 이미지 업로드, 실시간 입력값 검증(Regex), 비밀번호 확인 일치 체크
- **로그아웃**: 서버 세션 종료 및 클라이언트 로컬 스토리지 초기화

### 2. 게시글 관리 (CRUD)
- **목록 조회**: 게시글 리스트 렌더링, 조회수/댓글수/좋아요수 표시, 날짜 포맷팅
- **게시글 작성**: 텍스트 및 이미지 업로드 통합 처리 (`FormData` 활용)
- **게시글 수정/삭제**: 작성자 본인 확인 로직(Owner Check)을 통한 권한 제어
- **좋아요**: 게시글 상세 페이지 내 실시간 좋아요 토글 기능

### 3. 댓글 시스템
- **댓글 관리**: 게시글 상세 내 댓글 목록 조회, 작성, 수정, 삭제 기능
- **권한 제어**: 본인이 작성한 댓글에 대해서만 수정/삭제 버튼 활성화

### 4. 사용자 프로필 및 계정 관리
- **프로필 수정**: 닉네임 변경 및 프로필 이미지 실시간 업데이트
- **비밀번호 변경**: 현재 비밀번호 확인 및 새 비밀번호 복합 규칙(8~15자, 대소문자/숫자/특수문자 포함) 검사
- **회원 탈퇴**: 계정 삭제 처리 및 자동 로그아웃

### 5. API 통신 및 에러 핸들링
- **통합 API 모듈**: `request`, `get`, `post`, `patch`, `del`, `uploadFile` 등 표준화된 요청 함수 제공
- **에러 코드 매핑**: 백엔드 에러 코드(`ERROR_MESSAGES`)를 기반으로 한 사용자 친화적 한글 메시지 출력
- **자동 인증 리다이렉트**: 401(UNAUTHORIZED) 응답 시 자동으로 로그인 페이지로 이동
- **UI 피드백**: 토스트(Toast) 알림 및 커스텀 모달(Modal)을 통한 직관적인 처리 결과 안내

### 6. 프론트엔드 최적화 (UX·전송 효율)
- **무한 스크롤 최적화**: 스크롤 이벤트 대신 `IntersectionObserver`로 목록 하단 감지, 불필요한 함수 호출 감소(저사양 기기 버벅임 완화). 미지원 브라우저는 스크롤 기반 fallback 유지.
- **이미지 지연 로딩(Lazy Loading)**: 게시글 카드·댓글·프로필 등 모든 `<img>`에 `loading="lazy"` 적용. 첫 화면 로딩 시 보이지 않는 이미지 로딩을 지연해 초기 렌더링(LCP) 개선.
- **코드 경량화 및 번들링**:
  - **CSS**: `build-css.sh`에서 공통·페이지별 CSS를 한 파일로 합친 뒤, 프로덕션 빌드 시 esbuild로 최소화하여 `dist/css/style.min.css` 생성.
  - **JS**: `build-js.sh`로 페이지별 엔트리를 esbuild로 번들·최소화하여 `dist/js/pages/`에 출력. HTTP 요청 수 감소 및 파일 크기 최소화.
  - **HTML**: `build-html.sh`에 `prod` 모드 추가. 프로덕션 시 HTML을 `dist/`에 복사하고, CSS/JS 경로를 번들 파일(`style.min.css`, `js/pages/*.js`)로 변경.

## 폴더 구조
- `pages/`: 원본 HTML 템플릿 (auth, posts, profile 하위 구조)
- `css/`:
  - `common.css`: 전역 스타일, 변수, 공통 컴포넌트(버튼, 입력창 등)
  - `pages/`: 각 페이지별 전용 스타일 시트
- `js/`:
  - `api.js`: fetch API 래퍼, 에러/성공 처리, 토스트/모달 유틸리티
  - `error-messages.js`: 에러/성공 코드별 메시지 매핑 테이블
  - `pages/`: 페이지별 비즈니스 로직 및 이벤트 핸들러
  - `utils/`: 유효성 검사(`validation.js`) 등 공통 유틸리티
- `assets/`: 정적 리소스 (기본 프로필 이미지 등)
- `build-html.sh`: HTML 복사 및 경로 수정 (개발/프로덕션 모드 지원)
- `build-css.sh`: CSS 번들링 및 프로덕션 시 최소화 (`dist/css/style.css`, `dist/css/style.min.css`)
- `build-js.sh`: JS 페이지별 번들·최소화 (`dist/js/pages/`)
- `dist/`: 프로덕션 빌드 결과물 (HTML, CSS, JS, assets) — `npm run build:prod` 실행 시 생성

## 시작하기

본 프로젝트는 순수 HTML/CSS/JS로 구성되어 있으며, 백엔드 API와의 연동을 위해 **VS Code Live Server** 또는 **현재 폴더의 상위 디렉터리에 있는 통합 실행 스크립트(dev.sh)** 사용을 권장합니다.

### 1. 환경 준비
- **백엔드 실행**: 프론트엔드 기능의 정상 작동을 위해 백엔드 서버가 `http://localhost:8000`에서 실행 중이어야 합니다.
- **선택**: VS Code에서 `Live Server` 익스텐션 설치 시 포트 5500 사용을 권장합니다.
- **선택**: 프로덕션 빌드(번들·최소화)를 사용하려면 Node.js/npm 및 `npm install`로 의존성(esbuild) 설치가 필요합니다.

### 2. 프로젝트 실행
- **방법 A — Live Server**
  1. VS Code에서 `2-owen-community-fe` 폴더를 엽니다.
  2. 하단 상태 표시줄의 **[Go Live]** 버튼을 클릭하거나, `pages/auth/login.html`에서 우클릭 후 **[Open with Live Server]**를 선택합니다.
  3. 브라우저에서 `http://localhost:5500` 접속을 확인합니다.

- **방법 B — 통합 실행 스크립트(상위 디렉터리)**
  - **현재 폴더(2-owen-community-fe)의 상위 디렉터리**에서 `./dev.sh`를 실행하면 백엔드·DB 확인 후, 프론트는 **개발 모드**(개별 CSS/JS, HTML만 빌드)로 `http://localhost:5500`에서 서빙됩니다.
  - **번들 빌드로 테스트**하려면 상위 디렉터리에서 `./dev.sh prod`를 실행합니다. 이때 이 폴더에서 `npm run build:prod`가 실행된 뒤 `dist`에서 서빙됩니다.

### 3. 빌드 스크립트 (npm)
| 스크립트 | 설명 |
|----------|------|
| `npm run build` | HTML 경로 빌드 + CSS 번들링 (개발용) |
| `npm run build:prod` | 프로덕션 빌드: HTML → dist, CSS 번들·최소화, JS 번들·최소화 |
| `npm run build:html` | HTML만 복사 및 경로 수정 (개발용) |
| `npm run build:html:prod` | HTML을 dist에 복사 후 프로덕션 경로로 수정 |
| `npm run build:css` | CSS 번들링 및 (비 dev 시) 최소화 |
| `npm run build:js` | JS 페이지별 번들·최소화 → dist/js/pages/ |

개발 시에는 개별 파일을 사용하고, 배포·성능 검증 시에만 `build:prod`를 사용하는 구성을 권장합니다.

### 4. 주의 사항
- **CORS 설정**: 백엔드에 프론트엔드 주소(`localhost:5500`)가 CORS 허용 목록에 등록되어 있어야 합니다.
- **API 연동**: `js/api.js` 파일의 `API_BASE_URL`이 백엔드 주소와 일치하는지 확인하십시오.

## 프로젝트 특징
- **No Framework**: React, Vue 등 프레임워크 없이 순수 Vanilla JS로만 복잡한 상태와 UI 관리
- **에러 중심 설계**: 백엔드와의 명확한 에러 규격을 통해 견고한 예외 처리 구현
- **반응형 최적화**: 모바일 환경을 고려한 UI/UX 설계
- **보안 고려**: API 요청 시 `credentials: 'include'` 설정을 통한 안전한 쿠키 기반 인증
- **로딩·전송 최적화**: 무한 스크롤(IntersectionObserver), 이미지 lazy loading, CSS/JS 번들·최소화로 초기 렌더링 및 네트워크 요청 수 개선
