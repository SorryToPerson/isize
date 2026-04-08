import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { AppModule } from "./app.module";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const apiPrefix = configService.get<string>("app.apiPrefix", "api");
  const port = configService.get<number>("app.port", 3000);
  const enableCors = configService.get<boolean>("app.enableCors", true);
  const webDistPath = configService.get<string>("app.webDistPath");

  app.setGlobalPrefix(apiPrefix);

  if (enableCors) {
    app.enableCors();
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true
    })
  );

  const webIndexPath = resolve(webDistPath ?? "", "index.html");

  if (webDistPath && existsSync(webIndexPath)) {
    app.useStaticAssets(webDistPath);

    const server = app.getHttpAdapter().getInstance();
    const apiPathPattern = new RegExp(
      `^(?!\\/${escapeRegex(apiPrefix)}(?:\\/|$)).*`
    );

    server.get(
      apiPathPattern,
      (
        _request: unknown,
        response: { sendFile: (path: string) => void }
      ) => {
        response.sendFile(webIndexPath);
      }
    );
  }

  await app.listen(port);

  Logger.log(
    `Nest server is running on port ${port}, api prefix: /${apiPrefix}`,
    "Bootstrap"
  );
}

void bootstrap();
