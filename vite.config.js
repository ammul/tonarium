import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  base: '/tonarium/',
  resolve: {
    alias: [
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
      { find: '@tonarium/vue/styles', replacement: fileURLToPath(new URL('./packages/tonarium-vue/src/styles/index.css', import.meta.url)) },
      { find: '@tonarium/vue', replacement: fileURLToPath(new URL('./packages/tonarium-vue/src/index.ts', import.meta.url)) },
      { find: '@tonarium/learn', replacement: fileURLToPath(new URL('./packages/tonarium-learn/src/index.ts', import.meta.url)) },
      { find: '@tonarium/core', replacement: fileURLToPath(new URL('./packages/tonarium-core/src/index.ts', import.meta.url)) },
    ]
  },
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.test.js'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,vue}'],
      exclude: ['src/**/*.test.js']
    }
  }
})
