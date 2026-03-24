# Prooflog FE — 디자인 토큰 & 레이아웃

`css/common.css`의 `:root`에 정의된 값을 기준으로 피드·상세·설정 화면의 타이포·간격을 맞춥니다.

## 색상 (Material 3 / 다크)

| 토큰 | 용도 |
|------|------|
| `--color-bg` | 페이지 배경 |
| `--color-surface` | 카드·패널 |
| `--color-surface-high` | 호버·모달 패널 |
| `--color-primary` / `--color-primary-container` | 강조·버튼 그라데이션 |
| `--color-on-surface` / `--color-on-surface-variant` | 본문·보조 텍스트 |
| `--color-outline-variant` | 테두리 |

## 간격 (8px 그리드)

| 토큰 | rem | px (16px 기준) |
|------|-----|----------------|
| `--space-1` | 0.5 | 8 |
| `--space-2` | 1 | 16 |
| `--space-3` | 1.5 | 24 |
| `--space-4` | 2 | 32 |
| `--space-5` | 2.5 | 40 |
| `--space-6` | 3 | 48 |

섹션 간 여백·카드 패딩·필터 아래 마진 등에 사용합니다.

## 타이포 스케일

| 토큰 | 용도 |
|------|------|
| `--text-hero` | 피드 환영 제목 (clamp) |
| `--text-page-title` | 게시글 상세 제목 |
| `--text-section-title` | 페이지 H2·폼 제목 (1.25rem, 카드 제목과 동일 계열) |
| `--text-card-title` | 피드 카드 제목 |
| `--text-body` | 본문 1rem |
| `--text-caption` | 0.875rem |
| `--text-meta` | 메타·통계 0.75rem |
| `--text-badge` | 배지 0.625rem |

| `--max-width` | 피드·상세·헤더·작성 폼 공통 최대 폭 **45rem** (720px @16px) |

## 앱 셸 (내비게이션)

- **브레이크포인트**: `md:` = 768px (Tailwind 기본).
- **모바일**: 하단 탭 4개 (Feed / Records / 연동 / Profile), `pb-24`로 탭·FAB 여유.
- **데스크톱**: 상단 헤더는 `max-w-[var(--max-width)]`(45rem, 피드 컬럼과 동일)로 **Feed · Records**만 노출. 연동은 프로필 드롭다운(및 모바일 하단 탭)에서 진입. 하단 탭은 `md:hidden`.

소스 HTML은 `pages/` 아래에 두고, 빌드 후 `dist/` 루트의 평면 URL(`posts.html`, `integration.html` 등)로 치환됩니다.

## 확인 모달

파괴적 동작은 `showConfirmModal({ dangerConfirm: true })`로 빨간 확인 버튼(`.btn-confirm--danger`)을 씁니다. 브라우저 `confirm()`은 사용하지 않습니다.
