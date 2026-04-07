import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent
} from "react";
import {
  DEFAULT_PLATFORM_KEYS,
  INITIAL_CROP_STATE,
  PLATFORM_PRESETS,
  clampCropState,
  createArchiveName,
  createDownloadName,
  createPreviewDataUrl,
  downloadBlob,
  formatBytes,
  formatDateLabel,
  generateIconsFromSelection,
  getPreviewMetrics,
  loadImageElement,
  readHistoryRecords,
  readImageFile,
  revokeGeneratedIcons,
  saveHistoryRecord,
  type CropState,
  type GeneratedIcon,
  type PlatformKey,
  type UploadedImage
} from "./lib/icon-workbench";
import { buildZipBlob } from "./lib/zip";

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  startOffsetX: number;
  startOffsetY: number;
}

function createRecordId() {
  return `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default function App() {
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [crop, setCrop] = useState<CropState>(INITIAL_CROP_STATE);
  const [selectedPlatforms, setSelectedPlatforms] =
    useState<PlatformKey[]>(DEFAULT_PLATFORM_KEYS);
  const [generatedIcons, setGeneratedIcons] = useState<GeneratedIcon[]>([]);
  const [historyRecords, setHistoryRecords] = useState(() => readHistoryRecords());
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPackaging, setIsPackaging] = useState(false);
  const [compressionQuality, setCompressionQuality] = useState(0.8);
  const [includeIco, setIncludeIco] = useState(true);

  const dragStateRef = useRef<DragState | null>(null);

  useEffect(() => {
    return () => {
      revokeGeneratedIcons(generatedIcons);
    };
  }, [generatedIcons]);

  const selectedPresets = useMemo(
    () =>
      PLATFORM_PRESETS.filter((preset) => selectedPlatforms.includes(preset.key)),
    [selectedPlatforms]
  );

  const previewMetrics = useMemo(() => {
    if (!uploadedImage) return null;
    return getPreviewMetrics(uploadedImage.width, uploadedImage.height, crop);
  }, [crop, uploadedImage]);


  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0];
    if (!nextFile) return;

    try {
      const nextImage = await readImageFile(nextFile);
      setUploadedImage(nextImage);
      setCrop({ ...INITIAL_CROP_STATE });
      setGeneratedIcons([]);
    } catch (error) {
      alert(error instanceof Error ? error.message : "读取图片失败");
    } finally {
      event.target.value = "";
    }
  }

  function updateCrop(nextCrop: CropState) {
    if (!uploadedImage) return;
    setCrop(clampCropState(nextCrop, uploadedImage.width, uploadedImage.height));
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!uploadedImage) return;
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffsetX: crop.offsetX,
      startOffsetY: crop.offsetY
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragStateRef.current || !uploadedImage || !previewMetrics) return;

    const scale = previewMetrics.drawWidth / uploadedImage.width;
    const deltaX = (event.clientX - dragStateRef.current.startX) / scale;
    const deltaY = (event.clientY - dragStateRef.current.startY) / scale;

    updateCrop({
      ...crop,
      offsetX: dragStateRef.current.startOffsetX + deltaX,
      offsetY: dragStateRef.current.startOffsetY + deltaY
    });
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragStateRef.current?.pointerId === event.pointerId) {
      dragStateRef.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    }
  }

  function handleWheel(event: React.WheelEvent) {
    if (!uploadedImage) return;
    const delta = -event.deltaY * 0.001;
    const nextZoom = Math.min(Math.max(crop.zoom + delta, 1), 5);
    updateCrop({ ...crop, zoom: nextZoom });
  }

  async function handleGenerate() {
    if (!uploadedImage || selectedPresets.length === 0) return;
    setIsGenerating(true);

    try {
      const image = await loadImageElement(uploadedImage.src);
      const nextIcons = await generateIconsFromSelection(image, crop, selectedPresets, {
        compressionQuality,
        includeIco
      });
      const previewDataUrl = await createPreviewDataUrl(image, crop);

      setGeneratedIcons(nextIcons);
      setHistoryRecords(
        saveHistoryRecord({
          id: createRecordId(),
          createdAt: new Date().toISOString(),
          fileName: uploadedImage.fileName,
          sourceWidth: uploadedImage.width,
          sourceHeight: uploadedImage.height,
          previewDataUrl,
          selectedPlatforms,
          generatedCount: nextIcons.length,
          crop
        })
      );
    } catch (error) {
      alert(error instanceof Error ? error.message : "生成失败");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleDownloadZip() {
    if (generatedIcons.length === 0) return;
    setIsPackaging(true);
    try {
      const zipBlob = await buildZipBlob(
        generatedIcons.map((i) => ({ fileName: i.archivePath, blob: i.blob }))
      );
      downloadBlob(zipBlob, createArchiveName());
    } finally {
      setIsPackaging(false);
    }
  }

  return (
    <div className="app-container">
      <header>
        <div className="logo-group">
          <h1>iSize Icon Workbench</h1>
          <p>智能、快速、纯前端的图标处理专家</p>
        </div>
        <div className="flex-row">
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <button
            className="btn btn-outline"
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            {uploadedImage ? "更换图片" : "点击上传源图"}
          </button>
          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={!uploadedImage || isGenerating}
          >
            {isGenerating ? "正在处理..." : "开始生成"}
          </button>
        </div>
      </header>

      <main className="workbench">
        <section className="stage-container">
          <div
            className={`crop-stage ${!uploadedImage ? "empty" : ""}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onWheel={handleWheel}
            onDoubleClick={() => setCrop(INITIAL_CROP_STATE)}
          >
            {uploadedImage && previewMetrics ? (
              <>
                <img
                  src={uploadedImage.src}
                  alt="Source"
                  className="crop-image"
                  draggable={false}
                  style={{
                    width: `${previewMetrics.drawWidth}px`,
                    height: `${previewMetrics.drawHeight}px`,
                    transform: `translate(${previewMetrics.drawX}px, ${previewMetrics.drawY}px)`
                  }}
                />
                <div className="crop-overlay" />
              </>
            ) : (
              <div className="empty-hint">
                <p>等待源图导入...</p>
                <span>推荐使用 1024x1024 以上的清晰原图</span>
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">输出预览 ({generatedIcons.length})</span>
              <div className="flex-row">
                <button
                  className="btn btn-ghost"
                  disabled={generatedIcons.length === 0}
                  onClick={() => setGeneratedIcons([])}
                >
                  清空
                </button>
                <button
                  className="btn btn-primary"
                  disabled={generatedIcons.length === 0 || isPackaging}
                  onClick={handleDownloadZip}
                >
                  {isPackaging ? "打包中..." : "打包下载 ZIP"}
                </button>
              </div>
            </div>
            <div className="control-group">
              <div className="results-grid">
                {generatedIcons.map((icon) => (
                  <article key={icon.id} className="icon-card">
                    <div className="icon-preview">
                      <img src={icon.previewUrl} alt={icon.variant.fileName} />
                    </div>
                    <div className="icon-info">
                      <strong>{icon.variant.fileName.split("/").pop()}</strong>
                      <span>{icon.variant.width}x{icon.variant.height} · {formatBytes(icon.blob.size)}</span>
                    </div>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => downloadBlob(icon.blob, createDownloadName(icon.platformKey, icon.variant.fileName))}
                    >
                      下载
                    </button>
                  </article>
                ))}
                {generatedIcons.length === 0 && (
                  <div className="spacer" style={{ gridColumn: "1/-1", textAlign: "center", padding: "2rem", color: "var(--text-dim)" }}>
                    生成的图标将显示在这里
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <aside className="controls-stack">
          <div className="card">
            <div className="card-header">
              <span className="card-title">裁剪与控制</span>
            </div>
            <div className="control-group">
              <div className="field-block">
                <div className="label-row">
                  <label>比例缩放</label>
                  <span>{crop.zoom.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.01"
                  value={crop.zoom}
                  onChange={(e) => updateCrop({ ...crop, zoom: parseFloat(e.target.value) })}
                  disabled={!uploadedImage}
                />
              </div>
              <div className="field-block">
                <div className="label-row">
                  <label>PNG 质量压缩</label>
                  <span>{Math.round(compressionQuality * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={compressionQuality}
                  onChange={(e) => setCompressionQuality(parseFloat(e.target.value))}
                />
              </div>
              <div className="toggle-group">
                <label style={{ fontSize: "0.875rem", fontWeight: 500 }}>包含 ICO 网站图标</label>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={includeIco}
                    onChange={(e) => setIncludeIco(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">平台预设</span>
            </div>
            <div className="control-group">
              <div className="platform-grid">
                {PLATFORM_PRESETS.map((p) => (
                  <div
                    key={p.key}
                    className={`platform-item ${selectedPlatforms.includes(p.key) ? "active" : ""}`}
                    onClick={() => {
                      setSelectedPlatforms((curr) =>
                        curr.includes(p.key)
                          ? curr.filter((k) => k !== p.key)
                          : [...curr, p.key]
                      );
                    }}
                  >
                    <span>{p.label}</span>
                    <small>{p.variants.length} 个图标</small>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">最近记录</span>
            </div>
            <div className="history-list">
              {historyRecords.length > 0 ? (
                historyRecords.map((r) => (
                  <div key={r.id} className="history-item">
                    <img src={r.previewDataUrl} alt={r.fileName} />
                    <div className="history-detail">
                      <strong>{r.fileName}</strong>
                      <span>{formatDateLabel(r.createdAt)} · {r.generatedCount} 图标</span>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: "center", padding: "1rem", color: "var(--text-dim)", fontSize: "0.875rem" }}>
                  暂无历史记录
                </p>
              )}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
