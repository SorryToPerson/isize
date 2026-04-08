import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString
} from "class-validator";
import { PLATFORM_KEYS, type PlatformKey } from "../../icon/icon.constants";

export const EXPORT_MODES = ["zip", "single"] as const;

export type ExportMode = (typeof EXPORT_MODES)[number];

export class CreateExportPlanDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsIn(PLATFORM_KEYS, { each: true })
  platforms!: PlatformKey[];

  @IsIn(EXPORT_MODES)
  exportMode!: ExportMode;

  @IsOptional()
  @IsString()
  sourceFileName?: string;

  @IsOptional()
  @IsBoolean()
  includeManifest?: boolean;

  @IsOptional()
  @IsBoolean()
  preservePlatformFolders?: boolean;
}
