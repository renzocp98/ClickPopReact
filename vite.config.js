import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import rollupNodePolyFill from 'rollup-plugin-node-polyfills';

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis' 
  },
  optimizeDeps: {
    include: ['sockjs-client', '@stomp/stompjs']
  },
  build: {
    rollupOptions: {
      plugins: [rollupNodePolyFill()]
    }
  }
});
