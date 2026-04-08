import { Module } from "@nestjs/common";
import { ExportModule } from "./export/export.module";
import { HealthModule } from "./health/health.module";
import { IconModule } from "./icon/icon.module";

@Module({
  imports: [HealthModule, IconModule, ExportModule]
})
export class AppModule {}
