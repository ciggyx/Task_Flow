import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('API de Tareas')
    .setDescription(
      'Documentación de la API para tareas, prioridades y estados',
    )
    .setVersion('1.0')
    .addTag('Tasks')
    .addTag('Priorities')
    .addTag('Statuses')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // Ruta: http://localhost:3000/api

  await app.listen(3000);
}
bootstrap();
