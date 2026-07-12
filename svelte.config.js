import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    // 部署到 fadmin.vii.ink，应用内路径前缀为 /fadmin
    // 这样所有路由、静态资源、链接都带 /fadmin 前缀，与主站 vii.ink 完全隔离
    paths: {
      base: '/fadmin'
    },
    adapter: adapter({
      routes: {
        include: ['/*'],
        exclude: ['<all>']
      }
    })
  }
};

export default config;
