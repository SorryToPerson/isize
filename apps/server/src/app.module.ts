import { Module } from "@nestjs/common";
import { HealthModule } from "./health/health.module";
import { IconModule } from "./icon/icon.module";

@Module({
  imports: [HealthModule, IconModule]
})
export class AppModule {}
