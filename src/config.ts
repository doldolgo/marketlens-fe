// 시안(trading-room.dc.html)의 data-props 기본값.
// 나중에 유저 설정 화면이 생기면 여기가 설정 스토어로 대체될 자리.
export const HIGHLIGHT_THRESHOLD = 1.5; // 스프레드 하이라이트 임계값 (%)
export const STALE_SECONDS = 30;        // 이 초 이상 미수신이면 stale 처리
export const LIVE_UPDATES = true;       // false면 1.5초 tick 시뮬레이션 중지
export const COLOR_CONVENTION: '한국식' | '국제식' = '한국식';

// 백엔드 API — 같은 출처의 /api 로 보내면 nginx(배포)·Vite 프록시(개발)가
// 백엔드로 넘긴다. 주소를 코드에 박지 않으므로 빌드 환경을 안 탄다.
export const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';
export const SPREADS_POLL_MS = 5000;    // GET /spreads 폴링 주기 (ms)

// 상승/하락 색 — 한국식: 빨강=상승, 파랑=하락
const kr = COLOR_CONVENTION === '한국식';
export const POS = kr ? '#e0697d' : '#5fbf8f';
export const NEG = kr ? '#6f9bee' : '#e0697d';
export const pctColor = (v: number) =>
  v > 0 ? POS : v < 0 ? NEG : 'var(--color-neutral-400)';
