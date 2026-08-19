import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 개발 서버에서 /api 를 로컬 uvicorn 으로 넘긴다 — 배포의 nginx 프록시와
  // 같은 경로 규칙을 써서 코드에서 백엔드 주소를 분기하지 않기 위함.
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
