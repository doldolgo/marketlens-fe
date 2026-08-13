// 백엔드 GET /spreads 클라이언트.
// 응답 행은 화면의 SpreadRow 와 같은 형태이지만 (백엔드가 FE 계약에 맞춰 설계됨)
// 거래소만 소문자 ID(upbit/binance)로 온다. 화면·필터는 표시명('업비트'/'Binance')을
// 키로 쓰므로 여기서 한 번만 변환하고, 이후로는 mock 과 동일하게 흘러간다.
import { API_BASE } from '../config';
import type { SpreadRow } from './types';

// 백엔드 거래소 ID → 화면 표시명. 매핑에 없는 신규 거래소는 ID 그대로 노출
// (화면이 깨지진 않고, 필터 목록에 추가할지만 결정하면 된다)
const EX_NAME: Record<string, string> = {
  upbit: '업비트',
  bithumb: '빗썸',
  binance: 'Binance',
};
const exName = (id: string) => EX_NAME[id] ?? id;

export async function fetchSpreads(): Promise<{ rate: number; rows: SpreadRow[] }> {
  const res = await fetch(`${API_BASE}/spreads`);
  if (!res.ok) throw new Error(`GET /spreads ${res.status}`);
  const data = (await res.json()) as { rate: number; rows: SpreadRow[] };
  return {
    rate: data.rate,
    rows: data.rows.map(r => ({ ...r, dom: exName(r.dom), fx: exName(r.fx) })),
  };
}
