<!--
  系统设置
-->
<script lang="ts">
  import { toast } from '$lib/stores/toast';
  import { api } from '$lib/utils/api';
  import Segmented from '$lib/components/ui/Segmented.svelte';

  let { data } = $props();

  // 类型断言：config 是 Record<string, Record<string, unknown>>
  const allConfig = (data.config ?? {}) as Record<string, Record<string, unknown>>;

  // 本地可编辑的配置副本
  let siteConfig = $state<Record<string, unknown>>(structuredClone(allConfig.site ?? {}));
  let aiConfig = $state<Record<string, unknown>>(structuredClone(allConfig.ai ?? {}));
  let ratelimitConfig = $state<Record<string, unknown>>(structuredClone(allConfig.ratelimit ?? {}));
  let watermarkConfig = $state<Record<string, unknown>>(structuredClone(allConfig.watermark ?? {}));
  let imageConfig = $state<Record<string, unknown>>(structuredClone(allConfig.image ?? {}));
  let deployConfig = $state<Record<string, unknown>>(structuredClone(allConfig.deploy ?? {}));

  let saving = $state<string | null>(null);

  const modelOptions = [
    { label: '通义千问 14B', value: '@cf/qwen/qwen1.5-14b-chat-aliyun' },
    { label: '通义千问 QwQ 32B', value: '@cf/qwen/qwq-32b' },
    { label: 'Llama 3.1 8B', value: '@cf/meta/llama-3.1-8b-instruct' },
    { label: 'DeepSeek R1', value: '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b' }
  ];

  async function save(key: string, value: unknown) {
    saving = key;
    const result = await api('CONFIG_UPDATE', { key, value });
    if (result.ok) {
      toast.ok(`${key} 配置已保存`);
    } else {
      toast.error(result.error ?? '保存失败');
    }
    saving = null;
  }

  function str(v: unknown): string {
    return typeof v === 'string' ? v : typeof v === 'number' ? String(v) : '';
  }
  function num(v: unknown): number {
    return typeof v === 'number' ? v : 0;
  }
</script>

<svelte:head>
  <title>系统设置 · 柒色墨笺后台</title>
</svelte:head>

<div class="page-header">
  <h1 class="page-header__title">系统设置</h1>
  <p class="page-header__sub">站点、AI、限流、水印、部署配置</p>
</div>

{#if data.error}
  <div class="panel">
    <div class="empty-state">
      <div class="empty-state__title">无法加载配置</div>
      <p class="text-sm">{data.error}</p>
    </div>
  </div>
{:else}
  <div class="settings-grid">
    <!-- 站点信息 -->
    <div class="panel">
      <div class="panel__legend">
        站点信息 <span class="panel__legend-en">SITE</span>
      </div>
      <div class="form-grid">
        <div class="field field--full">
          <label class="field__label">站点标题</label>
          <input type="text" value={str(siteConfig.title)} oninput={(e) => (siteConfig.title = e.currentTarget.value)} />
        </div>
        <div class="field field--full">
          <label class="field__label">站点描述</label>
          <input type="text" value={str(siteConfig.description)} oninput={(e) => (siteConfig.description = e.currentTarget.value)} />
        </div>
        <div class="field">
          <label class="field__label">作者</label>
          <input type="text" value={str(siteConfig.author)} oninput={(e) => (siteConfig.author = e.currentTarget.value)} />
        </div>
        <div class="field">
          <label class="field__label">站点 URL</label>
          <input type="url" value={str(siteConfig.url)} oninput={(e) => (siteConfig.url = e.currentTarget.value)} />
        </div>
      </div>
      <button class="btn btn--primary btn--sm mt-4" onclick={() => save('site', siteConfig)} disabled={saving === 'site'}>
        {saving === 'site' ? '保存中...' : '保存'}
      </button>
    </div>

    <!-- AI 配置 -->
    <div class="panel">
      <div class="panel__legend">
        AI 配置 <span class="panel__legend-en">AI</span>
      </div>
      <div class="field mb-4">
        <label class="field__label">模型</label>
        <Segmented
          options={modelOptions}
          value={str(aiConfig.model)}
          onchange={(v) => (aiConfig.model = v)}
        />
      </div>
      <div class="field field--full mb-4">
        <label class="field__label">润色提示词</label>
        <textarea rows="3" value={str(aiConfig.polish_prompt)} oninput={(e) => (aiConfig.polish_prompt = e.currentTarget.value)}></textarea>
      </div>
      <div class="field field--full mb-4">
        <label class="field__label">元数据提取提示词</label>
        <textarea rows="3" value={str(aiConfig.metadata_prompt)} oninput={(e) => (aiConfig.metadata_prompt = e.currentTarget.value)}></textarea>
      </div>
      <div class="field field--full">
        <label class="field__label">评论审核提示词</label>
        <textarea rows="3" value={str(aiConfig.moderate_prompt)} oninput={(e) => (aiConfig.moderate_prompt = e.currentTarget.value)}></textarea>
      </div>
      <button class="btn btn--primary btn--sm mt-4" onclick={() => save('ai', aiConfig)} disabled={saving === 'ai'}>
        {saving === 'ai' ? '保存中...' : '保存'}
      </button>
    </div>

    <!-- 图片处理 -->
    <div class="panel">
      <div class="panel__legend">
        图片处理 <span class="panel__legend-en">IMAGE</span>
      </div>
      <div class="form-grid">
        <div class="field">
          <label class="field__label">最大宽度</label>
          <input type="number" value={num(imageConfig.max_width)} oninput={(e) => (imageConfig.max_width = parseInt(e.currentTarget.value) || 2400)} />
        </div>
        <div class="field">
          <label class="field__label">WebP 质量</label>
          <input type="number" value={num(imageConfig.quality)} oninput={(e) => (imageConfig.quality = parseInt(e.currentTarget.value) || 82)} />
        </div>
        <div class="field field--full">
          <label class="fm-toggle">
            <input type="checkbox" checked={imageConfig.auto_webp !== false} onchange={(e) => (imageConfig.auto_webp = e.currentTarget.checked)} />
            <span>自动转 WebP</span>
          </label>
        </div>
      </div>
      <button class="btn btn--primary btn--sm mt-4" onclick={() => save('image', imageConfig)} disabled={saving === 'image'}>
        {saving === 'image' ? '保存中...' : '保存'}
      </button>
    </div>

    <!-- 水印 -->
    <div class="panel">
      <div class="panel__legend">
        水印 <span class="panel__legend-en">WATERMARK</span>
      </div>
      <div class="form-grid">
        <div class="field field--full">
          <label class="fm-toggle">
            <input type="checkbox" checked={watermarkConfig.enabled === true} onchange={(e) => (watermarkConfig.enabled = e.currentTarget.checked)} />
            <span>启用水印</span>
          </label>
        </div>
        <div class="field">
          <label class="field__label">水印图路径</label>
          <input type="text" value={str(watermarkConfig.image_key)} oninput={(e) => (watermarkConfig.image_key = e.currentTarget.value)} />
        </div>
        <div class="field">
          <label class="field__label">位置</label>
          <select value={str(watermarkConfig.position)} onchange={(e) => (watermarkConfig.position = e.currentTarget.value)}>
            <option value="top-left">左上</option>
            <option value="top-right">右上</option>
            <option value="bottom-left">左下</option>
            <option value="bottom-right">右下</option>
            <option value="center">居中</option>
          </select>
        </div>
        <div class="field">
          <label class="field__label">透明度 (0-1)</label>
          <input type="number" step="0.1" min="0" max="1" value={num(watermarkConfig.opacity)} oninput={(e) => (watermarkConfig.opacity = parseFloat(e.currentTarget.value) || 0.6)} />
        </div>
        <div class="field">
          <label class="field__label">大小比例 (0-1)</label>
          <input type="number" step="0.05" min="0" max="1" value={num(watermarkConfig.scale)} oninput={(e) => (watermarkConfig.scale = parseFloat(e.currentTarget.value) || 0.15)} />
        </div>
      </div>
      <button class="btn btn--primary btn--sm mt-4" onclick={() => save('watermark', watermarkConfig)} disabled={saving === 'watermark'}>
        {saving === 'watermark' ? '保存中...' : '保存'}
      </button>
    </div>

    <!-- 限流 -->
    <div class="panel">
      <div class="panel__legend">
        限流 <span class="panel__legend-en">RATE LIMIT</span>
      </div>
      <div class="form-grid">
        <div class="field">
          <label class="field__label">通用阈值（请求/窗口）</label>
          <input type="number" value={num(ratelimitConfig.max)} oninput={(e) => (ratelimitConfig.max = parseInt(e.currentTarget.value) || 60)} />
        </div>
        <div class="field">
          <label class="field__label">窗口（秒）</label>
          <input type="number" value={num(ratelimitConfig.window)} oninput={(e) => (ratelimitConfig.window = parseInt(e.currentTarget.value) || 60)} />
        </div>
        <div class="field">
          <label class="field__label">评论阈值</label>
          <input type="number" value={num(ratelimitConfig.comment_max)} oninput={(e) => (ratelimitConfig.comment_max = parseInt(e.currentTarget.value) || 5)} />
        </div>
        <div class="field">
          <label class="field__label">评论窗口（秒）</label>
          <input type="number" value={num(ratelimitConfig.comment_window)} oninput={(e) => (ratelimitConfig.comment_window = parseInt(e.currentTarget.value) || 300)} />
        </div>
      </div>
      <button class="btn btn--primary btn--sm mt-4" onclick={() => save('ratelimit', ratelimitConfig)} disabled={saving === 'ratelimit'}>
        {saving === 'ratelimit' ? '保存中...' : '保存'}
      </button>
    </div>

    <!-- 部署 -->
    <div class="panel">
      <div class="panel__legend">
        部署配置 <span class="panel__legend-en">DEPLOY</span>
      </div>
      <div class="form-grid">
        <div class="field">
          <label class="field__label">GitHub 用户名</label>
          <input type="text" value={str(deployConfig.owner)} oninput={(e) => (deployConfig.owner = e.currentTarget.value)} />
        </div>
        <div class="field">
          <label class="field__label">仓库名</label>
          <input type="text" value={str(deployConfig.repo)} oninput={(e) => (deployConfig.repo = e.currentTarget.value)} />
        </div>
        <div class="field field--full">
          <label class="field__label">Workflow 文件</label>
          <input type="text" value={str(deployConfig.workflow)} oninput={(e) => (deployConfig.workflow = e.currentTarget.value)} placeholder="deploy.yml" />
          <div class="field__hint">GITHUB_TOKEN 需用 wrangler secret 设置，不在此处填写</div>
        </div>
      </div>
      <button class="btn btn--primary btn--sm mt-4" onclick={() => save('deploy', deployConfig)} disabled={saving === 'deploy'}>
        {saving === 'deploy' ? '保存中...' : '保存'}
      </button>
    </div>
  </div>
{/if}

<style>
  .settings-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .fm-toggle {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-family: var(--font-kai);
    font-size: 13px;
  }
</style>
