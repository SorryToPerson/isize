import { Module } from "@nestjs/common";
import { IconModule } from "../icon/icon.module";
import { ExportController } from "./export.controller";
import { ExportService } from "./export.service";

@Module({
  imports: [IconModule],
  controllers: [ExportController],
  providers: [ExportService]
})
export class ExportModule {}
