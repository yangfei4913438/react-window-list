import { defineConfig, loadEnv, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import eslint from 'vite-plugin-eslint';

// https://vitejs.dev/config/
export default ({ mode }: UserConfig) => {
  process.env = { ...process.env, ...loadEnv(mode ?? 'development', process.cwd()) };

  return defineConfig({
    esbuild: {
      jsxFactory: 'h',
      jsxFragment: 'Fragment',
    },
    server: {
      proxy: {},
    },
    plugins: [react(), eslint()],
    resolve: {
      alias: {
        src: '/src', // 映射的目录必须以/开头，表示根目录
      },
    },
  });
};
