import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, transform: true, forbidUnknownValues: true,
  }));

  const cfg = new DocumentBuilder()
    .setTitle('Superb API')
    .setDescription('CRUD + RBAC API (users, roles, permissions, groups, posts)')
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'bearer'
    )
    .build();

  const doc = SwaggerModule.createDocument(app, cfg);
  SwaggerModule.setup('api', app, doc, {
    swaggerOptions: { persistAuthorization: true, displayRequestDuration: true },
    customSiteTitle: 'Superb API Docs',
  });

  app.enableCors({ origin: '*', methods: 'GET,HEAD,PUT,PATCH,POST,DELETE' });
  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();
