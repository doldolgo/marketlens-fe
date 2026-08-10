// ⚠️ 시현용 mock 데이터 생성기 — 시안 로직 그대로 포팅.
// 백엔드 연동 시 이 파일(과 useFeed의 tick 시뮬레이션)만 실데이터 소스로 교체하면 된다.
// 화면 쪽은 types.ts의 형태만 알고 있으므로 여기 외에는 손댈 곳이 없어야 함.
import { rng, hashSeed } from '../lib/rng';
import type {
  SpreadRow, IoInfo, GapCoin, FlowAddr, FlowRow, HistEvent,
  HealthCard, HealthEvLog, FeedStatus,
} from './types';

export class MockFeed {
  rate = 1392.4;          // USDT/KRW 암묵환율
  rateOfficial = 1383.6;  // 고시환율
  spreads: SpreadRow[] = [];
  io: Record<string, IoInfo> = {};
  gapd: GapCoin[] = [];
  flow: FlowRow[] = [];
  flowAddrs: FlowAddr[] = [];
  flowPx: Record<string, number> = {};
  private evCache: Record<string, HistEvent[]> = {};

  constructor() {
    this.buildData();
    this.buildFlow();
  }

  private buildData() {
    const R = rng(20260717);
    const coins: [string, number][] = [['BTC',118420],['ETH',4123],['XRP',2.91],['SOL',182.4],['DOGE',0.2134],['ADA',0.887],['TRX',0.302],['LINK',24.6],['AVAX',41.2],['DOT',8.42],['SUI',4.05],['APT',10.8],['ARB',1.12],['OP',2.31],['SEI',0.512],['ATOM',9.14],['NEAR',6.72],['HBAR',0.246],['ETC',31.5],['STX',2.04],['ONDO',1.42],['PEPE',0.0000162],['WLD',3.86],['TIA',6.18]];
    const doms = ['업비트', '빗썸'];
    const fxs = ['Binance', 'Bybit', 'Bitget', 'MEXC', 'Gate.io', 'Hyperliquid'];
    const rows: SpreadRow[] = [];
    coins.forEach((c, ci) => {
      const domList = ci % 5 === 4 ? ['업비트'] : doms;
      const fxList = fxs.filter((_f, fi) => (ci + fi) % 2 === 0 || fi < 2);
      domList.forEach(dom => fxList.forEach(fx => {
        const base = (R() * 2.6 - 0.4) + (c[0] === 'BTC' ? 0.9 : 0);
        const fwd = Math.round(base * 100) / 100;
        const rev = Math.round((-fwd - 0.35 + (R() - 0.5) * 0.3) * 100) / 100;
        const usd = c[1] * (1 + (R() - 0.5) * 0.002);
        const roll = R();
        const status: FeedStatus = roll < 0.03 ? 'fail' : roll < 0.09 ? 'stale' : 'ok';
        const spark: number[] = []; let v = 1;
        for (let i = 0; i < 28; i++) { v += (R() - 0.5) * 0.06; spark.push(v); }
        const liqBase = c[0] === 'BTC' || c[0] === 'ETH' ? 4.0e8 : 1.2e7 + R() * 1.1e8;
        rows.push({ sym: c[0], dom, fx, fwd, rev, usd, spark, status, age: status === 'stale' ? 45 + R() * 300 : R() * 8,
          liqDom: liqBase * (0.35 + R() * 0.5), liqFx: liqBase * (0.8 + R() * 0.9) });
      }));
    });
    this.spreads = rows;

    this.io = {};
    coins.forEach(c => doms.concat(fxs).forEach(ex => {
      const R3 = rng(hashSeed('io|' + c[0] + '|' + ex));
      const a = R3(), b = R3();
      this.io[c[0] + '|' + ex] = {
        dep: a > 0.13, wd: b > 0.16,
        net: c[0] === 'USDT' || c[0] === 'USDC' ? (a > 0.5 ? 'TRC20' : 'ERC20')
          : c[0] === 'ETH' ? (a > 0.55 ? 'ERC20' : 'Arbitrum')
          : c[0] === 'LINK' || c[0] === 'AAVE' || c[0] === 'UNI' ? 'ERC20'
          : c[0] === 'BTC' ? 'BTC' : c[0] === 'SOL' ? 'SOL' : c[0] === 'XRP' ? 'XRP'
          : c[0] === 'TRX' ? 'TRC20' : c[0] === 'MATIC' ? 'Polygon' : c[0] === 'AVAX' ? 'C-Chain' : c[0],
      };
    }));

    this.gapd = coins.map((c, ci) => {
      const R2 = rng(hashSeed('gap|' + c[0]));
      const mkSt = (): FeedStatus => { const roll = R2(); return roll < 0.03 ? 'fail' : roll < 0.09 ? 'stale' : 'ok'; };
      const spots = fxs.filter((_f, fi) => (ci + fi) % 3 !== 1).map(ex => ({ ex, off: (R2() - 0.5) * 0.3, status: mkSt(), age: R2() * 8 }));
      const perps = fxs.filter((_f, fi) => (ci + fi) % 3 !== 2).map(ex => ({ ex, prem: (R2() - 0.5) * 1.4, funding: Math.round((R2() - 0.5) * 0.08 * 1000) / 1000, status: mkSt(), age: R2() * 8 }));
      [...spots, ...perps].forEach(x => { if (x.status === 'stale') x.age = 45 + R2() * 300; });
      return { sym: c[0], base: c[1], spots, perps };
    });
  }

  private buildFlow() {
    const R = rng(hashSeed('flow|v1'));
    this.flowPx = { BTC: 118420, ETH: 4123, XRP: 2.91, SOL: 182.4, DOGE: 0.2134, TRX: 0.302, ADA: 0.887, LINK: 24.6, AVAX: 41.2 };
    const A = (id: string, label: string, coins: string[], exs: string[]): FlowAddr => ({ id, label, coins, exs });
    const addrs = [
      A('rN7pH2k4LmXv39cQ4', 'Unknown', ['XRP', 'SOL', 'DOGE'], ['업비트', '빗썸', 'Binance']),
      A('0x4f2a91c7be08d3a58b71', 'Wintermute', ['ETH', 'LINK', 'AVAX', 'SOL'], ['Binance', 'Bybit', 'Gate.io']),
      A('0x9d17e5442ba0f6913ce2', 'Bybit 출금', ['ETH', 'XRP', 'ADA'], ['Bybit', '업비트']),
      A('TQm5vXr8Ldz1Ns47hL2', '개인지갑', ['TRX', 'DOGE'], ['빗썸', 'MEXC']),
      A('0xa38cb6014e7d2f0541ff', 'Jump Trading', ['BTC', 'ETH', 'SOL'], ['Binance', 'Hyperliquid', 'Bitget']),
      A('bc1qh4jr7zpm2xd06lu9v0', 'Unknown', ['BTC'], ['업비트', 'Binance']),
      A('0x71be3f8a05cd9142c05d', 'Binance 14', ['ETH', 'AVAX', 'LINK'], ['Binance']),
      A('rM2sQdT9Vb6Xy4kT8', '개인지갑', ['XRP', 'ADA'], ['업비트', '빗썸']),
      A('0xc90f2d7134ae55b62a6e', 'Cumberland', ['BTC', 'ETH', 'TRX'], ['Bitget', 'Gate.io', 'Binance']),
      A('TNz8Wp3Jq7Ry2Vd5rY1', 'MEXC 출금', ['TRX', 'XRP', 'DOGE'], ['MEXC', '빗썸']),
      A('0x3ea7c1b859fd420a9d40', 'Unknown', ['SOL', 'LINK'], ['Bybit', '업비트']),
      A('So7Kq2ZvRt5Ne8XwmB4x', '개인지갑', ['SOL', 'DOGE', 'ADA'], ['업비트', 'Bitget']),
      A('0xdd51a6f39c04be277c18', 'GSR Markets', ['ETH', 'AVAX', 'BTC'], ['Hyperliquid', 'Binance', 'Bybit']),
      A('0x62f9047ade31c5b8b3aa', 'Upbit 입금집계', ['XRP', 'TRX', 'ETH', 'ADA'], ['업비트']),
      A('rK9tGvBc4Ph7Ls2wN6', 'Unknown', ['XRP', 'SOL'], ['빗썸', 'Gate.io']),
    ];
    this.flowAddrs = addrs;
    const short = (id: string) => id.slice(0, 6) + '…' + id.slice(-4);
    const rows: FlowRow[] = [];
    addrs.forEach(a => {
      const n = 2 + Math.floor(R() * 2.4);
      for (let i = 0; i < n; i++) {
        const coin = a.coins[Math.floor(R() * a.coins.length)];
        const ex = a.exs[Math.floor(R() * a.exs.length)];
        const dir = R() < 0.6 ? 'in' as const : 'out' as const;
        const usd = Math.round(Math.pow(10, 4.4 + R() * 2.45) / 100) * 100;
        const drop = R() < 0.055;  // 일부는 시세 미확인(usd null) 케이스
        rows.push({
          addr: a.id, label: a.label, short: short(a.id), coin, ex, dir,
          usd: drop ? null : usd, qty: usd / this.flowPx[coin],
          status: dir === 'in' ? (R() < 0.45 ? '입금 감지' : 'sweep 확정') : (R() < 0.4 ? '브로드캐스트' : '확정'),
          age: Math.round(9 + Math.pow(R(), 2.1) * 16800),
        });
      }
    });
    rows.sort((x, y) => x.age - y.age);
    this.flow = rows;
  }

  // 1.5초마다 호출 — 실시간 수신을 흉내내 일부 값만 랜덤 갱신
  tick() {
    this.rate += (Math.random() - 0.5) * 0.4;
    for (const r of this.spreads) {
      if (r.status === 'fail') continue;
      if (r.status !== 'stale' && Math.random() < 0.25) {
        r.fwd = Math.round((r.fwd + (Math.random() - 0.5) * 0.12) * 100) / 100;
        r.rev = Math.round((-r.fwd - 0.35 + (Math.random() - 0.5) * 0.2) * 100) / 100;
        r.usd *= 1 + (Math.random() - 0.5) * 0.001;
        r.age = 0;
        if (Math.random() < 0.4) { r.spark.push(r.spark[r.spark.length - 1] + (Math.random() - 0.5) * 0.05); r.spark.shift(); }
      } else r.age += 1.5;
    }
    for (const g of this.gapd) for (const x of [...g.spots, ...g.perps]) {
      if (x.status === 'fail') continue;
      if (x.status !== 'stale' && Math.random() < 0.25) {
        if ('prem' in x) { x.prem += (Math.random() - 0.5) * 0.06; x.funding = Math.round((x.funding + (Math.random() - 0.5) * 0.004) * 1000) / 1000; }
        else x.off += (Math.random() - 0.5) * 0.03;
        x.age = 0;
      } else x.age += 1.5;
    }
    for (const r of this.flow) r.age += 1.5;
  }

  // 기록/통계 탭용 과거 스프레드 사건 생성 — 기간별 1회 생성 후 캐시
  events(per: '1주' | '1달' | '3달', now: number): HistEvent[] {
    const ck = per + '|v2';
    if (this.evCache[ck]) return this.evCache[ck];
    const syms = [...new Set(this.spreads.map(r => r.sym))];
    const spanMs = { '1주': 6048e5, '1달': 2592e6, '3달': 7776e6 }[per];
    const baseN = { '1주': 7, '1달': 22, '3달': 55 }[per];
    const out: HistEvent[] = [];
    syms.forEach(sy => {
      const R = rng(hashSeed('ev|' + sy + '|' + per));
      const act = 0.15 + R() * R() * 2.2;  // 티커별 활동성 편차
      const mk = (n2: number, type: 'kimp' | 'rev') => {
        for (let i = 0; i < n2; i++) out.push({ sym: sy, type, dom: R() < 0.68 ? '업비트' : '빗썸', start: now - spanMs + R() * spanMs, durMin: 4 + Math.pow(R(), 2) * 340, peak: Math.round((0.6 + Math.pow(R(), 1.6) * 3.2) * 100) / 100 });
      };
      mk(Math.round(act * baseN * (0.7 + R() * 0.6)), 'kimp');
      mk(Math.round(act * baseN * (0.25 + R() * 0.5)), 'rev');
    });
    return this.evCache[ck] = out;
  }
}

// 수집 상태 — 일 단위 시드라 하루 동안은 같은 모양 유지.
// KPI 스트립(전 탭 공통)과 수집 상태 탭이 같이 쓴다.
export function buildHealth(now: number): { cards: HealthCard[]; evLog: HealthEvLog[] } {
  const R = rng(hashSeed('health|' + Math.floor(now / 864e5)));
  const EXS: [string, number, number][] = [['업비트', 132, 0], ['빗썸', 98, 0], ['Binance', 210, 168], ['Bybit', 174, 152], ['Bitget', 140, 128], ['MEXC', 188, 0], ['Gate.io', 164, 96], ['Hyperliquid', 0, 118]];
  const cards: HealthCard[] = EXS.map(([name, spot, perp]) => {
    const roll = R();
    const st = roll < 0.72 ? 'ok' as const : roll < 0.9 ? 'stale' as const : 'down' as const;
    const failPct = st === 'ok' ? R() * 0.8 : st === 'stale' ? 2 + R() * 6 : 100;
    const lastSec = st === 'ok' ? R() * 5 : st === 'stale' ? 60 + R() * 400 : 1800 + R() * 3600;
    const gaps: { start: number; w: number }[] = [];
    const ng = st === 'ok' ? (R() < 0.4 ? 1 : 0) : st === 'stale' ? 2 : 3;
    for (let g2 = 0; g2 < ng; g2++) { const st2 = R() * 0.92; const w = 0.004 + Math.pow(R(), 2) * (st === 'down' ? 0.1 : 0.03); gaps.push({ start: st2, w }); }
    if (st === 'down') gaps.push({ start: 1 - lastSec / 86400, w: lastSec / 86400 });
    return { name, spot, perp, st, failPct, lastSec, gaps };
  });
  const EVT: [string, string][] = [['재연결', 'WebSocket 재연결 성공 (시도 2회)'], ['rate limit', '요청 한도 경고 — 수집 주기 2배로 완화'], ['구독 실패', '신규 마켓 구독 실패, 30초 후 재시도'], ['재연결', '연결 끊김 감지, 재연결 시도 중'], ['지연', '수신 지연 45초 초과 — stale 처리']];
  const evLog: HealthEvLog[] = Array.from({ length: 12 }, () => {
    const ev = EVT[Math.floor(R() * EVT.length)];
    const ex = cards[Math.floor(R() * cards.length)];
    const t = new Date(now - R() * 864e5 * 0.4);
    return {
      time: (t.getMonth() + 1) + '/' + t.getDate() + ' ' + String(t.getHours()).padStart(2, '0') + ':' + String(t.getMinutes()).padStart(2, '0') + ':' + String(t.getSeconds()).padStart(2, '0'),
      ex: ex.name, tag: ev[0], msg: ev[1], t: t.getTime(),
    };
  }).sort((a, b) => b.t - a.t);
  return { cards, evLog };
}
