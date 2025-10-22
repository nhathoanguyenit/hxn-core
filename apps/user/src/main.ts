import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalHttpExceptionFilter } from '@libs/common/filters/global-http-exception.filter';
import { NestExpressApplication } from "@nestjs/platform-express";
import { SwaggerConfig } from '@libs/common/configurations/swagger.config';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { join } from "path";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // app.setGlobalPrefix("/api/chat-svc");
  app.use(cookieParser());
  app.useGlobalFilters(new GlobalHttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setBaseViewsDir(join(__dirname, "..", "views"));
  app.setViewEngine("ejs");

  SwaggerConfig.config(app);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
