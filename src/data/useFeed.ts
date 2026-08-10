// 데이터 구독 훅 — 컴포넌트는 이 훅만 바라본다.
// 지금은 MockFeed + 1.5초 tick 시뮬레이션. 백엔드 붙일 때 이 훅 내부를
// WebSocket/REST 구독으로 교체하면 화면 코드는 그대로 동작해야 한다.
import { useEffect, useRef, useState } from 'react';
import { MockFeed } from './mockFeed';
import { LIVE_UPDATES } from '../config';

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
    return () => clearInterval(t);
  }, []);

  return { feed: feedRef.current, now };
}
