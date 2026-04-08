**先建立脑图**
NestJS 你可以先把它理解成“有强约束目录结构和依赖注入的 Node 后端框架”。

在你这个项目里，最重要的 5 个概念已经都出现了：

- 启动入口：[`main.ts`](/Users/xuxiansheng/Desktop/openSource/isize/apps/server/src/main.ts#L1)
- 根模块：[`app.module.ts`](/Users/xuxiansheng/Desktop/openSource/isize/apps/server/src/app.module.ts#L1)
- 功能模块：[`icon.module.ts`](/Users/xuxiansheng/Desktop/openSource/isize/apps/server/src/icon/icon.module.ts#L1)
- 控制器：[`icon.controller.ts`](/Users/xuxiansheng/Desktop/openSource/isize/apps/server/src/icon/icon.controller.ts#L1)
- 业务服务：[`icon.service.ts`](/Users/xuxiansheng/Desktop/openSource/isize/apps/server/src/icon/icon.service.ts#L1)
- 请求参数校验：[`plan-icon-task.dto.ts`](/Users/xuxiansheng/Desktop/openSource/isize/apps/server/src/icon/dto/plan-icon-task.dto.ts#L1)

你可以用前端思维去类比：

- `Controller` = 路由入口层，只负责接收请求、调用 service、返回结果
- `Service` = 真正业务逻辑层
- `DTO` = 表单 schema / 参数约束
- `Module` = 一个业务域的边界
- `main.ts` = 应用启动和全局配置

**你现在这个项目是怎么工作的**
请求链路基本是这样：

1. 浏览器请求 `/api/v1/icon/plan`
2. [`main.ts`](/Users/xuxiansheng/Desktop/openSource/isize/apps/server/src/main.ts#L8) 先启动 Nest，并挂全局校验 `ValidationPipe`
3. [`icon.controller.ts`](/Users/xuxiansheng/Desktop/openSource/isize/apps/server/src/icon/icon.controller.ts#L5) 接收请求
4. `@Body()` 自动把请求体转成 [`PlanIconTaskDto`](/Users/xuxiansheng/Desktop/openSource/isize/apps/server/src/icon/dto/plan-icon-task.dto.ts#L16)
5. DTO 上的装饰器负责校验参数是否合法
6. Controller 调用 [`IconService`](/Users/xuxiansheng/Desktop/openSource/isize/apps/server/src/icon/icon.service.ts#L57)
7. Service 返回业务结果
8. Nest 自动转成 JSON 响应

这就是 Nest 最标准的写法。

**代码应该怎么写**
建议你记住一条最重要的规则：

- `controller` 薄
- `service` 厚
- `dto` 严
- `module` 清晰

也就是：

- 不要把业务判断堆在 controller 里
- controller 里最好只有“收参数 -> 调 service -> return”
- 参数校验放 DTO
- 业务逻辑放 service
- 一个业务一个 module，不要全塞 `app.module.ts`

你当前的 [`icon.controller.ts`](/Users/xuxiansheng/Desktop/openSource/isize/apps/server/src/icon/icon.controller.ts#L5) 就是很标准的薄 controller。

**文件应该放在哪**
Nest 项目推荐按“业务模块”拆，不按“controllers/services/types”横着拆。

你这个项目后面适合长成这样：

```text
apps/server/src/
├── main.ts
├── app.module.ts
├── config/
├── common/
├── health/
├── icon/
│   ├── dto/
│   ├── icon.module.ts
│   ├── icon.controller.ts
│   ├── icon.service.ts
│   └── constants.ts
├── export/
│   ├── dto/
│   ├── export.module.ts
│   ├── export.controller.ts
│   └── export.service.ts
└── image/
    ├── dto/
    ├── image.module.ts
    └── image.service.ts
```

对你这个图标项目，我建议未来这样分：

- `icon`：平台预设、任务规划
- `image`：图片缩放、裁切、格式处理
- `export`：zip、文件命名、导出结果
- `health`：健康检查
- `config`：环境变量和配置
- `common`：通用工具、异常、拦截器、过滤器

**怎么新增一个完整功能**
比如你要做 `POST /api/v1/export/zip`，标准做法是新建一个 `export` 模块。

要加的文件通常是：

- `apps/server/src/export/export.module.ts`
- `apps/server/src/export/export.controller.ts`
- `apps/server/src/export/export.service.ts`
- `apps/server/src/export/dto/create-export.dto.ts`

最小骨架长这样：

```ts
@Controller("v1/export")
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post("zip")
  createZip(@Body() dto: CreateExportDto) {
    return this.exportService.createZip(dto);
  }
}
```

```ts
@Injectable()
export class ExportService {
  createZip(dto: CreateExportDto) {
    return {
      ok: true,
      files: dto.files,
    };
  }
}
```

```ts
export class CreateExportDto {
  @IsArray()
  @ArrayMinSize(1)
  files!: string[];
}
```

然后在 `export.module.ts` 里注册 controller 和 service，再把模块挂到 [`app.module.ts`](/Users/xuxiansheng/Desktop/openSource/isize/apps/server/src/app.module.ts#L1)。

**怎么 dev**
你项目里已经配好了脚本，在 [`apps/server/package.json`](/Users/xuxiansheng/Desktop/openSource/isize/apps/server/package.json#L1)。

常用命令：

- 根目录开发启动：`npm run dev:server`
- 只跑 server：`npm run start:dev --workspace @isize/server`
- 构建：`npm run build:server`
- 运行构建产物：`node apps/server/dist/main.js`

你现在的接口前缀是 `/api`，所以本地常见地址会是：

- `GET /api/health`
- `GET /api/v1/icon/presets`
- `POST /api/v1/icon/plan`

**怎么 build**
Nest 的 build 本质上就是把 TypeScript 编译成 JS。

你这里已经能直接：

- `npm run build:server`

产物会在：

- `apps/server/dist`

生产运行一般就是：

```bash
node apps/server/dist/main.js
```

**怎么发布**
你现在已经有两条路：

- 纯 Node 单容器：[`Dockerfile`](/Users/xuxiansheng/Desktop/openSource/isize/Dockerfile#L1)
- 旧的 Nginx 备份版：[`Dockerfile.nginx`](/Users/xuxiansheng/Desktop/openSource/isize/Dockerfile.nginx#L1)

默认发布方式已经是：

- `docker compose up -d --build`

配置在：

- [`docker-compose.yml`](/Users/xuxiansheng/Desktop/openSource/isize/docker-compose.yml#L1)

如果不用 Docker，也可以：

1. `npm ci`
2. `npm run build:contracts`
3. `npm run build:web`
4. `npm run build:server`
5. `node apps/server/dist/main.js`

**怎么改配置文件**
你当前项目还是“轻配置”模式，直接在 [`main.ts`](/Users/xuxiansheng/Desktop/openSource/isize/apps/server/src/main.ts#L40) 用 `process.env.PORT`。

这对初期够用，但真正做完整项目，我建议下一步接入 `@nestjs/config`，变成：

- `.env.development`
- `.env.production`
- `src/config/app.config.ts`
- `ConfigModule.forRoot(...)`

这样以后你改端口、域名、是否开启 CORS、文件目录、第三方密钥，都不会散落在代码里。

**给前端同学的最实用建议**
先别急着学全家桶概念，先把下面这套用熟：

- 会写 `Module`
- 会写 `Controller`
- 会写 `Service`
- 会写 `DTO`
- 会看懂依赖注入 `constructor(private readonly xxx: XxxService) {}`
- 会用 `class-validator`
- 会跑 `dev/build/docker compose`

只要这几件事熟了，你就已经能独立写 NestJS 业务接口了。

如果你愿意，我下一步可以直接在你这个仓库里给你“手把手新增一个完整的 `export` 模块”，从建文件到写接口到本地联调，一步一步带你做。
