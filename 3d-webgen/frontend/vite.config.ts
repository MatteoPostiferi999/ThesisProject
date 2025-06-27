import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
// Nel tuo vite.config.js LOCALE
export default defineConfig(({ mode }) => ({
  server: {
    cors: false,
    strictPort: true,
    host: "::",
    port: 8080,
    proxy: {
      "/api": {
        target: "http://129-146-48-166:8000",  // Lambda backend
        changeOrigin: true,
        secure: false,
      },
    }, 
  },

    // Build configuration per Netlify
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        }
      }
    }
  },

    // Environment variables per production
  define: {
    'process.env.VITE_API_URL': mode === 'production' 
      ? '"http://129.146.48.166:8000"'  // IP Lambda per ora
      : '"http://129.146.48.166:8000"'
  },
  
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
