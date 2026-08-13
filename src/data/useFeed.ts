// 데이터 구독 훅 — 컴포넌트는 이 훅만 바라본다.
// 스프레드/환율은 백엔드 GET /spreads 폴링(실데이터), 나머지 탭은 아직 MockFeed.
// 첫 폴링이 성공하기 전까지는 mock 스프레드가 보인다(백엔드 없이도 화면 확인 가능).
// 성공 이후로는 백엔드가 진실이고, 장애가 이어지면 age 가 쌓여 stale 로 드러난다.
import { useEffect, useRef, useState } from 'react';
import { MockFeed } from './mockFeed';
import { LIVE_UPDATES, SPREADS_POLL_MS } from '../config';
import { fetchSpreads } from './liveFeed';

export function useFeed(): { feed: MockFeed; now: number } {
  const feedRef = useRef<MockFeed | null>(null);
  if (!feedRef.current) feedRef.current = new MockFeed();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!LIVE_UPDATES) return;
    const t = setInterval(() => {
      feedRef.current!.tick();
      setNow(Date.now());  // now 갱신 = 리렌더 트리거 겸용
    }, 1500);

    let alive = true;  // 언마운트 뒤 도착한 응답이 feed 를 건드리지 않게
    const poll = async () => {
      try {
        const { rate, rows } = await fetchSpreads();
        if (alive) { feedRef.current!.applySpreads(rows, rate); setNow(Date.now()); }
      } catch {
        // 백엔드 미기동·일시 장애 — 직전 데이터 유지, tick 이 age 를 올려 stale 처리
      }
    };
    poll();
    const p = setInterval(poll, SPREADS_POLL_MS);
    return () => { alive = false; clearInterval(t); clearInterval(p); };
  }, []);

  return { feed: feedRef.current, now };
}
