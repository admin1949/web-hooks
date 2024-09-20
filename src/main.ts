import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RawBodyMiddleware } from './raw-body/raw-body.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(RawBodyMiddleware());
  await app.listen(3000);
}
bootstrap();
