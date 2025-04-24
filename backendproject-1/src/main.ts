import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Serve static files for images
  app.use(
    '/product-images',
    express.static(join(__dirname, '..', 'uploads/products')),
  );

  // ✅ Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Coffee example')
    .setDescription('The Coffee API description')
    .setVersion('1.0')
    .addTag('coffee')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  // ✅ Middleware และ Global Pipes
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  // ✅ Start Server
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
