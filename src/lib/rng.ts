// 시드 기반 의사난수 (mulberry32) — 목데이터가 리로드해도 같은 모양을 유지하기 위함.
// 시안 로직 그대로 포팅. 백엔드 연동 후에는 목데이터와 함께 제거될 파일.
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// FNV-1a 해시 — 문자열 키('gap|BTC' 등)로 독립 시드를 만들 때 사용
export function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
