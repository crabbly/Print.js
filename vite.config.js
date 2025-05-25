import { defineConfig } from 'vite';
import path from 'path'; // Added for potential alias use

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
  ],
  server: {
    port: 8080, // Using the same port as webpack-dev-server was configured for
    // open: '/test/manual/index.html', // Optional: to open specific page
  },
  build: {
    outDir: 'dist', // Default output directory
    lib: { // Configure for library mode as Print.js is a library
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'printJS', // UMD name
      fileName: (format) => `print-js.${format}.js`
    },
    rollupOptions: { // Optional: if specific rollup options are needed
      // external: [], // e.g., if you have peer dependencies
      output: {
        // Global variables to use in the UMD build for externalized deps
        // globals: { vue: 'Vue' }
      }
    }
  },
  resolve: { // Added resolve for clarity, though defaults might work
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
