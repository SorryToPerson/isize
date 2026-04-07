import { Body, Controller, Get, Post } from "@nestjs/common";
import { PlanIconTaskDto } from "./dto/plan-icon-task.dto";
import { IconService } from "./icon.service";

@Controller("v1/icon")
export class IconController {
  constructor(private readonly iconService: IconService) {}

  @Get("presets")
  getPresets() {
    return this.iconService.getPresets();
  }

  @Post("plan")
  planTask(@Body() dto: PlanIconTaskDto) {
    return this.iconService.planTask(dto);
  }
}
