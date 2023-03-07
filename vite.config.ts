/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference types="vitest"  />
/// <reference types="vite/client"  />

import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react-swc';
import * as path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./src/test/setup.ts'],
	},
	resolve: {
		alias: {
			'@components': path.resolve(__dirname, './src/components'), 
      '@utils': path.resolve(__dirname, './src/utils'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@test': path.resolve(__dirname, './src/test'),
			'@connection': path.resolve(__dirname, './src/internals'),
      '@custom-types': path.resolve(__dirname, './src/custom-types'),
      '@style': path.resolve(__dirname, './src/style'),
      '@store': path.resolve(__dirname, './src/store'),
		},
	},
});
