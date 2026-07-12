# 部署指南

## 部署到 Cloudflare Workers

### 1. 完成本地配置

按 [SETUP.md](./SETUP.md) 完成 D1/R2 创建、密钥设置。

### 2. 执行远程数据库迁移

```bash
npm run db:migrate:prod
```

### 3. 设置生产密钥

```bash
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put GITHUB_TOKEN
# 如果启用评论管理：
npx wrangler secret put WALINE_TOKEN
```

### 4. 构建并部署

```bash
npm run deploy
# 等价于：npm run build && wrangler deploy
```

部署成功后会输出 Worker 地址，如 `https://vii-ink-fadmin.<你的子域>.workers.dev`。

### 5. 绑定自定义域名（可选）

在 Cloudflare Dashboard：

1. **Workers & Pages** → 选择 `vii-ink-fadmin` → **Settings** → **Triggers** → **Custom Domains**
2. 添加 `fadmin.vii.ink`
3. Cloudflare 会自动创建 DNS 记录和 SSL 证书

如果你希望访问路径严格是 `fadmin.vii.ink/fadmin`，当前 `svelte.config.js` 已配置 `base: '/fadmin'`。

如果希望直接用 `fadmin.vii.ink`（不带 /fadmin），修改 `svelte.config.js` 移除 `paths.base`，并同步修改 `hooks.server.ts` 和路由中的路径引用。

---

## 定时任务

`wrangler.toml` 配置了两条 cron：

| Cron | 用途 | 处理函数 |
|---|---|---|
| `*/15 * * * *` | 每 15 分钟检查定时发布任务 | `scheduled()` 中 `SCHEDULE` 事件 |
| `0 19 * * *` | 每天 UTC 19:00（北京 03:00）备份 D1 到 R2 | `scheduled()` 中 `BACKUP` 事件 |

部署后 cron 自动生效，无需额外配置。

---

## 本地预览构建产物

```bash
npm run build
npm run preview
# 访问 http://localhost:4173/fadmin
```

---

## 更新部署

代码修改后，重新执行：
```bash
npm run deploy
```

如果有新的 migration 文件：
```bash
npm run db:migrate:prod
```

---

## 回滚

Cloudflare Workers 支持版本回滚：

```bash
npx wrangler deployments list    # 查看历史版本
npx wrangler deployments rollback  # 回滚到上一版本
```
