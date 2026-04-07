import { useState } from "react";

const platformCards = [
  {
    key: "web",
    title: "WEB / PWA",
    summary: "覆盖 favicon、Apple Touch Icon 与 PWA 安装图标。",
    executor: "浏览器内直接处理",
    sizes: ["16", "32", "180", "192", "512"],
    note: "适合官网、后台、落地页和 PWA。"
  },
  {
    key: "ios",
    title: "iOS / iPadOS",
    summary: "遵循 App Store 与设备图标基础规格。",
    executor: "客户端优先，规则由平台预设驱动",
    sizes: ["120", "167", "180", "1024"],
    note: "避免预加圆角，重点检查安全区。"
  },
  {
    key: "android",
    title: "Android",
    summary: "覆盖主流 mipmap 规格与商店图标。",
    executor: "客户端优先",
    sizes: ["48", "72", "96", "192", "512"],
    note: "需提示前景图留白与不同品牌蒙版差异。"
  },
  {
    key: "desktop",
    title: "macOS / Windows",
    summary: "桌面端多尺寸资源打包与命名规则。",
    executor: "复杂打包时回退后端兜底",
    sizes: ["16", "32", "256", "512", "1024"],
    note: "尤其适合后续补齐 icns / Windows 目录结构。"
  }
] as const;

const architectureCards = [
  {
    title: "Local-first",
    body: "所有历史记录与最近配置仅保存在客户端本地，不默认上传用户素材。"
  },
  {
    title: "Client-first processing",
    body: "Web 端优先使用 Canvas、Worker 和本地 zip 能力处理图标，降低服务端成本。"
  },
  {
    title: "Server fallback",
    body: "NestJS 只负责规格查询、任务规划和重型导出兜底，不做持久化。"
  }
];

const milestones = [
  "M0：三端骨架、规则文档、PRD 与共享规格占位",
  "M1：上传、裁切、Web / iOS / Android 预设、批量导出",
  "M2：服务端兜底、移动端导入导出、复杂平台补齐"
];

export default function App() {
  const [activePlatform, setActivePlatform] = useState(platformCards[0].key);
  const [fileName, setFileName] = useState("支持 PNG / JPG，后续补充 SVG");

  const currentPlatform =
    platformCards.find((item) => item.key === activePlatform) ?? platformCards[0];

  return (
    <main className="app-shell">
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">Icon Processing Workspace</p>
          <h1>一次上传，生成 Web、App 与桌面平台所需的图标矩阵</h1>
          <p className="hero-description">
            这是 `iSize` 的第一版工作台骨架。它把产品方向、平台规格和后续研发路径先落成结构化界面，
            方便我们接下来逐个完成上传、裁切、导出和服务端兜底。
          </p>

          <div className="hero-actions">
            <label className="primary-action" htmlFor="source-upload">
              选择源图
            </label>
            <input
              id="source-upload"
              type="file"
              accept="image/*"
              className="file-input"
              onChange={(event) => {
                const nextFile = event.target.files?.[0]?.name;
                setFileName(nextFile ?? "支持 PNG / JPG，后续补充 SVG");
              }}
            />
            <span className="file-note">{fileName}</span>
          </div>

          <div className="hero-stats">
            <article>
              <strong>3 端</strong>
              <span>Web / App / Server</span>
            </article>
            <article>
              <strong>16-1024</strong>
              <span>覆盖主要输出尺寸</span>
            </article>
            <article>
              <strong>Local-first</strong>
              <span>默认不保存用户素材</span>
            </article>
          </div>
        </div>

        <div className="pipeline-card">
          <p className="panel-title">核心流程</p>
          <ol className="pipeline-list">
            <li>导入原图并校验清晰度</li>
            <li>完成 1:1 正方形裁切</li>
            <li>选择目标平台与导出模式</li>
            <li>客户端优先处理，必要时回退后端</li>
            <li>导出单图或 zip，并写入本地历史</li>
          </ol>
        </div>
      </section>

      <section className="content-section">
        <div className="section-header">
          <p className="eyebrow">Platform Presets</p>
          <h2>按平台规范组织输出规格</h2>
        </div>

        <div className="platform-grid">
          {platformCards.map((platform) => (
            <button
              key={platform.key}
              type="button"
              className={`platform-card ${
                platform.key === currentPlatform.key ? "is-active" : ""
              }`}
              onClick={() => setActivePlatform(platform.key)}
            >
              <span>{platform.title}</span>
              <small>{platform.summary}</small>
            </button>
          ))}
        </div>

        <article className="platform-detail">
          <div>
            <p className="panel-title">{currentPlatform.title}</p>
            <p className="detail-summary">{currentPlatform.summary}</p>
            <p className="detail-note">{currentPlatform.note}</p>
          </div>

          <div className="detail-side">
            <span className="executor-chip">{currentPlatform.executor}</span>
            <div className="size-list">
              {currentPlatform.sizes.map((size) => (
                <span key={size}>{size} px</span>
              ))}
            </div>
          </div>
        </article>
      </section>

      <section className="content-section">
        <div className="section-header">
          <p className="eyebrow">Architecture</p>
          <h2>先把职责边界定清楚，再逐个交付能力</h2>
        </div>

        <div className="architecture-grid">
          {architectureCards.map((card) => (
            <article key={card.title} className="info-card">
              <p className="panel-title">{card.title}</p>
              <p>{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="section-header">
          <p className="eyebrow">Roadmap</p>
          <h2>后续按阶段推进，避免一次把平台规则做散</h2>
        </div>

        <div className="roadmap-list">
          {milestones.map((milestone) => (
            <article key={milestone} className="roadmap-item">
              {milestone}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
