# MarketLens Frontend

김프/차익거래 모니터링 대시보드 "트레이딩룸" 프론트엔드.
디자인 시안(`trading-room.dc.html`)을 React로 포팅한 상태이며, 현재는 **전부 mock 데이터**로 동작한다.

## 실행

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # 프로덕션 빌드 (dist/)
```

## 탭 구성

| 탭 | 내용 |
|---|---|
| 실시간 스프레드 | 코인별 최적 김프/역프 페어 + 슬리피지 반영 + 입출금 가능 여부 |
| 기록/통계 | 과거 스프레드 사건(임계 초과 구간) 티커별 통계·타임라인 |
| 선물–현물 갭 | 해외 현물 ↔ 선물 베이시스 스캔 |
| 선선갭 | perp ↔ perp 가격갭·펀딩비갭 |
| 수집 상태 | 거래소별 수집 파이프라인 헬스체크 |
| 입출금 레이더 | 온체인 입출금 흐름을 코인/주소 기준으로 피벗 탐색 |

## 구조 & 백엔드 연동 포인트

```
src/
├── config.ts          # 임계값·색 컨벤션 등 표시 설정
├── theme.css          # Nocturne 디자인 토큰 (source of truth)
├── index.css          # 전역 스타일 + hover 유틸
├── lib/               # 포맷터·시드 RNG (순수 함수)
├── data/
│   ├── types.ts       # ★ 화면이 소비하는 데이터 계약 — 백엔드 API 스키마 초안
│   ├── mockFeed.ts    # ★ mock 데이터 생성기 — 백엔드 연동 시 교체 대상
│   └── useFeed.ts     # ★ 데이터 구독 훅 — WebSocket/REST로 교체할 지점
├── components/ui.tsx  # 세그먼트 컨트롤 등 공용 조각
└── tabs/              # 탭별 화면 (SpreadTab, FlowTab, ...)
```

백엔드를 붙일 때는 `data/` 아래 세 파일만 건드리면 된다:
`types.ts`의 형태로 응답을 맞추고, `useFeed.ts` 내부의 MockFeed + 1.5초 tick을
실제 구독(WebSocket/폴링)으로 교체. 탭 컴포넌트는 수정 없이 그대로 동작해야 한다.
