import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as swStats from 'swagger-stats';
import { AllExceptionsFilter } from './contexts/shared/infraestructure/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new AllExceptionsFilter());

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

  // Swagger. API Documentation
  const config = new DocumentBuilder()
    .setTitle('ToDo APP')
    .setDescription('Application to keep track of tasks to perfom')
    .setVersion('1.0')
    .addTag('todos')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  // Swagger Stats

  app.enableCors();

  app.use(swStats.getMiddleware({ uriPath: '/swagger-stats' }));

  await app.listen(3000);
}

bootstrap();
