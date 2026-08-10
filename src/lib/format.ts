// 표시용 포맷터 모음 — 시안 로직 그대로 포팅한 순수 함수들
export const fmtKRW = (v: number) =>
  v >= 100 ? Math.round(v).toLocaleString('ko-KR')
  : v >= 1 ? v.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  : v.toLocaleString('ko-KR', { maximumFractionDigits: 4 });

export const fmtUSDT = (v: number) =>
  v >= 1000 ? v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  : v >= 1 ? v.toFixed(3)
  : v >= 0.001 ? v.toFixed(4)
  : v.toFixed(8);

export const fmtPct = (v: number) => (v > 0 ? '+' : '') + v.toFixed(2) + '%';

export const fmtAge = (s: number) =>
  s < 60 ? Math.round(s) + '초 전' : Math.round(s / 60) + '분 전';

export const fmtAgo = (s: number) =>
  s < 60 ? Math.round(s) + '초 전'
  : s < 3600 ? Math.round(s / 60) + '분 전'
  : Math.round(s / 3600) + '시간 전';

export const fmtQty = (v: number) =>
  v >= 1000 ? v.toLocaleString('en-US', { maximumFractionDigits: 0 })
  : v >= 1 ? v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  : v.toFixed(4);

export const fmtUsd = (v: number | null) =>
  v == null ? '–' : '$' + Math.round(v).toLocaleString('en-US');

// ms 차이 → 상대 시각
export const fmtRel = (ms: number) => {
  const m = ms / 60e3;
  return m < 1 ? '방금' : m < 60 ? Math.round(m) + '분 전'
    : m < 1440 ? Math.round(m / 60) + '시간 전' : Math.round(m / 1440) + '일 전';
};

// 분 → 지속시간
export const fmtDur = (m: number) =>
  m < 60 ? Math.round(m) + '분' : Math.floor(m / 60) + '시간 ' + Math.round(m % 60) + '분';

export const fmtDT = (t: number) => {
  const d = new Date(t);
  return (d.getMonth() + 1) + '/' + d.getDate() + ' '
    + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
};

export const fmtD = (t: number) => {
  const d = new Date(t);
  return (d.getMonth() + 1) + '/' + d.getDate();
};
