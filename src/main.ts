import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { PdfController } from './infrastructure/controllers/pdf.controller';
import * as bodyParser from 'body-parser';

@Module({
  controllers: [PdfController],
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  await app.listen(3003);
}
bootstrap();
