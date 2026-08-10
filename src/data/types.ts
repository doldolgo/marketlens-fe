// 화면이 소비하는 데이터 형태 — 백엔드 API 응답 스키마의 초안이기도 함.
// 백엔드 연동 시 이 타입을 기준으로 계약을 맞추고 mockFeed만 교체한다.

export type FeedStatus = 'ok' | 'stale' | 'fail';

// 국내 거래소 × 해외 거래소 김프/역프 페어 1개
export interface SpreadRow {
  sym: string;
  dom: string;          // 국내 거래소 (업비트/빗썸)
  fx: string;           // 해외 거래소
  fwd: number;          // 순방향 김프 %
  rev: number;          // 역방향 %
  usd: number;          // 해외 USD 가격
  spark: number[];
  status: FeedStatus;
  age: number;          // 마지막 수신 후 경과 초
  liqDom: number;       // 국내 호가 유동성 (USD 환산) — 슬리피지 추정용
  liqFx: number;
}

// 코인×거래소별 입출금 지원 여부
export interface IoInfo { dep: boolean; wd: boolean; net: string }

export interface GapSpot { ex: string; off: number; status: FeedStatus; age: number }
export interface GapPerp { ex: string; prem: number; funding: number; status: FeedStatus; age: number }
export interface GapCoin { sym: string; base: number; spots: GapSpot[]; perps: GapPerp[] }

// 입출금 레이더
export interface FlowAddr { id: string; label: string; coins: string[]; exs: string[] }
export interface FlowRow {
  addr: string; label: string; short: string;
  coin: string; ex: string; dir: 'in' | 'out';
  usd: number | null;   // null = 시세 미확인
  qty: number;
  status: string;       // 입금 감지 / sweep 확정 / 브로드캐스트 / 확정
  age: number;
}

// 기록/통계 탭의 스프레드 사건
export interface HistEvent {
  sym: string; type: 'kimp' | 'rev'; dom: string;
  start: number; durMin: number; peak: number;
}

// 수집 상태 탭
export interface HealthCard {
  name: string; spot: number; perp: number;
  st: 'ok' | 'stale' | 'down';
  failPct: number; lastSec: number;
  gaps: { start: number; w: number }[];  // 24h 타임라인 내 결측 구간 (0~1 비율)
}
export interface HealthEvLog { time: string; ex: string; tag: string; msg: string; t: number }
