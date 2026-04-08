import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { appConfig } from "./config/app.config";
import { resolveEnvFilePaths } from "./config/env-paths";
import { ExportModule } from "./export/export.module";
import { HealthModule } from "./health/health.module";
import { IconModule } from "./icon/icon.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [appConfig],
      envFilePath: resolveEnvFilePaths()
    }),
    HealthModule,
    IconModule,
    ExportModule
  ]
})
export class AppModule {}
