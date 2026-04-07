import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min
} from "class-validator";

export const PLATFORM_KEYS = [
  "web",
  "ios",
  "macos",
  "android",
  "windows",
  "miniprogram"
] as const;

export type PlatformKey = (typeof PLATFORM_KEYS)[number];

export class PlanIconTaskDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsIn(PLATFORM_KEYS, { each: true })
  platforms!: PlatformKey[];

  @IsInt()
  @Min(16)
  sourceWidth!: number;

  @IsInt()
  @Min(16)
  sourceHeight!: number;

  @IsOptional()
  @IsString()
  sourceMimeType?: string;

  @IsOptional()
  @IsBoolean()
  hasOffscreenCanvas?: boolean;

  @IsOptional()
  @IsBoolean()
  hasZipSupport?: boolean;

  @IsOptional()
  @IsBoolean()
  preferLossless?: boolean;
}
