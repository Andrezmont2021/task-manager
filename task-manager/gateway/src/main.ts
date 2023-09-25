import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  // Note: Its recommended to establish CORS with options, example: set allowed origins (fronts that send request)
  const app = await NestFactory.create(AppModule, { cors: true });

  //API versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });
  // Set the validation pipe globally
  app.useGlobalPipes(new ValidationPipe());

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Task Manager API')
    .setDescription('This API is intended to manage tasks and users')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('tasks')
    .addTag('users')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-documentation', app, document);

  await app.listen(process.env.PORT);
}
bootstrap();
