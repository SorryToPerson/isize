import { Body, Controller, Get, Post } from "@nestjs/common";
import { CreateExportPlanDto } from "./dto/create-export-plan.dto";
import { ExportService } from "./export.service";

@Controller("v1/export")
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get("modes")
  getModes() {
    return this.exportService.getModes();
  }

  @Post("plan")
  createPlan(@Body() dto: CreateExportPlanDto) {
    return this.exportService.createPlan(dto);
  }
}
