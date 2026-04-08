export const PLATFORM_KEYS = [
  "web",
  "ios",
  "macos",
  "android",
  "windows",
  "miniprogram"
] as const;

export type PlatformKey = (typeof PLATFORM_KEYS)[number];
