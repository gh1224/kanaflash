import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Vercel 환경 변수를 빌드 타임에 주입하여 브라우저에서 process.env.API_KEY 참조 에러를 방지합니다.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
  },
});