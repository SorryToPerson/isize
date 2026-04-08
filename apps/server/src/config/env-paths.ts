import { existsSync } from "node:fs";
import { resolve } from "node:path";

function uniquePaths(paths: string[]) {
  return [...new Set(paths)];
}

export function resolveEnvFilePaths(nodeEnv = process.env.NODE_ENV ?? "development") {
  const candidates = uniquePaths([
    resolve(process.cwd(), "apps/server/.env.local"),
    resolve(process.cwd(), `apps/server/.env.${nodeEnv}`),
    resolve(process.cwd(), "apps/server/.env"),
    resolve(process.cwd(), ".env.local"),
    resolve(process.cwd(), `.env.${nodeEnv}`),
    resolve(process.cwd(), ".env")
  ]);

  const existingPaths = candidates.filter((candidate) => existsSync(candidate));

  return existingPaths.length > 0 ? existingPaths : candidates;
}
