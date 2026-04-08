import { Injectable } from "@nestjs/common";
import { IconService } from "../icon/icon.service";
import { type PlatformKey } from "../icon/icon.constants";
import {
  type CreateExportPlanDto,
  EXPORT_MODES
} from "./dto/create-export-plan.dto";

function normalizeName(value?: string) {
  const safeName = value?.trim().replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "-");

  return safeName && safeName.length > 0 ? safeName : "icon-pack";
}

function createArchiveName(platforms: PlatformKey[], sourceFileName?: string) {
  const platformSuffix = platforms.join("-");
  const baseName = normalizeName(sourceFileName);

  return `${baseName}-${platformSuffix}.zip`;
}

@Injectable()
export class ExportService {
  constructor(private readonly iconService: IconService) {}

  getModes() {
    return {
      modes: EXPORT_MODES,
      recommendations: [
        {
          mode: "zip",
          summary: "适合多平台多文件场景，后续也最适合服务端兜底。"
        },
        {
          mode: "single",
          summary: "适合前端逐个下载单图，或让用户只挑选一张输出资源。"
        }
      ]
    };
  }

  createPlan(dto: CreateExportPlanDto) {
    const presets = this.iconService.getPresetSummaries(dto.platforms);
    const files = presets.flatMap((preset) =>
      preset.sizes.map((size) => ({
        platformKey: preset.key,
        platformLabel: preset.label,
        fileName: `${size}x${size}.png`,
        archivePath:
          dto.preservePlatformFolders === false
            ? `${preset.key}-${size}x${size}.png`
            : `${preset.key}/${size}x${size}.png`,
        recommendedExecutor: preset.recommendedExecutor
      }))
    );
    const recommendedExecutor = files.some(
      (item) => item.recommendedExecutor === "server"
    )
      ? "server"
      : "client";
    const warnings: string[] = [];

    if (dto.exportMode === "single" && files.length > 1) {
      warnings.push("当前选择会生成多个文件，single 模式更适合作为逐个下载而不是一次打包。");
    }

    if (dto.includeManifest) {
      warnings.push("includeManifest 当前只返回规划结果，后续可以扩展为真正生成 manifest 文件。");
    }

    return {
      exportMode: dto.exportMode,
      recommendedExecutor,
      archiveName:
        dto.exportMode === "zip"
          ? createArchiveName(dto.platforms, dto.sourceFileName)
          : null,
      totalFiles: files.length,
      files,
      warnings,
      nextSteps: [
        "前端根据 files 展示导出文件清单",
        recommendedExecutor === "client"
          ? "优先在客户端完成导出"
          : "必要时回退服务端执行打包",
        dto.exportMode === "zip"
          ? "生成压缩包文件名并准备下载"
          : "按文件逐个输出下载按钮"
      ]
    };
  }
}
