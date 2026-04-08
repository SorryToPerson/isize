import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix("api");
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true
    })
  );

  const webDistPath = resolve(__dirname, "../../web/dist");
  const webIndexPath = resolve(webDistPath, "index.html");

  if (existsSync(webIndexPath)) {
    app.useStaticAssets(webDistPath);

    const server = app.getHttpAdapter().getInstance();

    server.get(
      /^(?!\/api(?:\/|$)).*/,
      (
        _request: unknown,
        response: { sendFile: (path: string) => void }
      ) => {
        response.sendFile(webIndexPath);
      }
    );
  }

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
