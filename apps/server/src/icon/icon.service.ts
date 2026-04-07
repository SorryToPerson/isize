import { Injectable } from "@nestjs/common";
import { PlanIconTaskDto, PlatformKey } from "./dto/plan-icon-task.dto";

interface IconPresetSummary {
  key: PlatformKey;
  label: string;
  recommendedExecutor: "client" | "server";
  sizes: number[];
  designNotes: string[];
}

const ICON_PRESETS: IconPresetSummary[] = [
  {
    key: "web",
    label: "WEB / PWA",
    recommendedExecutor: "client",
    sizes: [16, 32, 180, 192, 512],
    designNotes: ["favicon 与 PWA 建议保持同一主视觉。"]
  },
  {
    key: "ios",
    label: "iOS",
    recommendedExecutor: "client",
    sizes: [120, 167, 180, 1024],
    designNotes: ["不要在源图里预先裁圆角。"]
  },
  {
    key: "android",
    label: "Android",
    recommendedExecutor: "client",
    sizes: [48, 72, 96, 144, 192, 512],
    designNotes: ["前景图建议保留安全留白。"]
  },
  {
    key: "macos",
    label: "macOS",
    recommendedExecutor: "client",
    sizes: [16, 32, 128, 256, 512, 1024],
    designNotes: ["关注小尺寸下的可辨识度。"]
  },
  {
    key: "windows",
    label: "Windows",
    recommendedExecutor: "server",
    sizes: [44, 50, 150, 310],
    designNotes: ["磁贴与商店图标建议由后端统一打包。"]
  },
  {
    key: "miniprogram",
    label: "小程序",
    recommendedExecutor: "client",
    sizes: [32, 64, 128],
    designNotes: ["作为扩展平台保留位，后续继续细化。"]
  }
];

@Injectable()
export class IconService {
  getPresets() {
    return {
      presets: ICON_PRESETS,
      productRules: {
        localFirst: true,
        serverPersistsFiles: false,
        clientFirstProcessing: true
      }
    };
  }

  planTask(dto: PlanIconTaskDto) {
    const warnings: string[] = [];
    const reasons: string[] = [];

    if (dto.sourceWidth < 1024 || dto.sourceHeight < 1024) {
      warnings.push("建议使用至少 1024 x 1024 的源图，以避免大尺寸导出模糊。");
    }

    if (!dto.hasOffscreenCanvas) {
      reasons.push("当前客户端缺少 OffscreenCanvas，复杂导出更适合服务端兜底。");
    }

    if (!dto.hasZipSupport) {
      reasons.push("当前客户端缺少稳定的打包能力，批量导出建议走服务端。");
    }

    if (Math.max(dto.sourceWidth, dto.sourceHeight) > 4096) {
      reasons.push("源图尺寸过大，服务端处理更稳定。");
    }

    if (dto.platforms.includes("windows")) {
      reasons.push("Windows 平台的多规格输出建议统一由服务端处理。");
    }

    const preferredExecutor = reasons.length > 0 ? "server" : "client";
    const selectedPresets = ICON_PRESETS.filter((preset) =>
      dto.platforms.includes(preset.key)
    );

    return {
      preferredExecutor,
      warnings,
      reasons:
        reasons.length > 0
          ? reasons
          : ["当前任务适合直接在客户端完成处理与导出。"],
      selectedPresets,
      nextSteps: [
        "先生成正方形裁切结果",
        "根据平台规格映射导出文件列表",
        preferredExecutor === "client"
          ? "直接在客户端完成缩放与打包"
          : "回退服务端执行导出与压缩"
      ]
    };
  }
}
