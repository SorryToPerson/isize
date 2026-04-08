import { registerAs } from "@nestjs/config";
import { existsSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";

function toNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function toBoolean(value: string | undefined, fallback: boolean) {
  if (value === undefined) {
    return fallback;
  }

  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function resolveWebDistPath(value?: string) {
  if (value && value.trim().length > 0) {
    return isAbsolute(value) ? value : resolve(process.cwd(), value);
  }

  const candidates = [
    resolve(process.cwd(), "apps/web/dist"),
    resolve(process.cwd(), "../web/dist")
  ];

  const matchedPath = candidates.find((candidate) => existsSync(candidate));

  return matchedPath ?? candidates[0];
}

export const appConfig = registerAs("app", () => ({
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: toNumber(process.env.PORT, 3000),
  enableCors: toBoolean(process.env.ENABLE_CORS, true),
  apiPrefix: process.env.API_PREFIX?.trim() || "api",
  webDistPath: resolveWebDistPath(process.env.WEB_DIST_PATH)
}));
