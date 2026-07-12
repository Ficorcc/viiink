// 系统设置：加载所有配置
import type { PageServerLoad } from './$types';
import { createRepos } from '$lib/server/db';

export const load: PageServerLoad = async ({ platform }) => {
  if (!platform?.env?.DB) {
    return { config: {}, error: '数据库未配置' };
  }

  const repos = createRepos(platform.env.DB);
  try {
    const config = await repos.config.getAll();
    return { config };
  } catch (e) {
    return { config: {}, error: e instanceof Error ? e.message : '加载失败' };
  }
};
