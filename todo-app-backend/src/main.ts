import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Ajusta la url: http://localhost/api
  app.setGlobalPrefix('api');

  // Ajustar transform a true hará que Nest intente transformar las entradas
  // con el tipado del Dto
  // whitelist en true eliminará propiedades que no están en los Dto
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      // whitelist: true,
      transformOptions: {
        // enableImplicitConversion: true,
      },
    }),
  );

  await app.listen(3000);
}

bootstrap();
