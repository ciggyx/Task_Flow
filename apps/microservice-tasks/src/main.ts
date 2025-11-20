import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Conexión al microservicio
  app.connectMicroservice({
    transport: Transport.TCP,
    options: { port: 4000 },
  });

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('API de Tareas')
    .setDescription('Documentación de la API para tareas, prioridades y estados')
    .setVersion('1.0')
    .addTag('Tasks')
    .addTag('Priorities')
    .addTag('Statuses')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // Ruta: http://localhost:3000/api

  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
