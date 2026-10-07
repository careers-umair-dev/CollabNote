import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Response } from 'express';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';
import { NestExpressApplication } from '@nestjs/platform-express';
import { RedirectController } from './redirect.controller';
import { Server } from 'http';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Request logging middleware
  app.use(new RequestLoggerMiddleware().use.bind(new RequestLoggerMiddleware()));

  // Redirect root to API docs
  app.use('/', (req, res: Response) => {
    res.redirect('/api');
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('CollabNote API')
    .setDescription('API documentation for CollabNote application')
    .setVersion('1.0')
    .setContact(
      'Umair Ansari',
      'https://github.com/careers-umair-dev',
      'careers.umair@gmail.com',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Swagger UI
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'CollabNote API Documentation',
    customCssUrl:
      process.env.VERCEL === '1'
        ? 'https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css'
        : undefined,
    customJs:
      process.env.VERCEL === '1'
        ? 'https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js'
        : undefined,
  });

  const port = process.env.PORT || 4000;

  // For Vercel serverless environment
  if (process.env.VERCEL === '1') {
    return app.getHttpAdapter().getInstance();
  }

  await app.listen(port);
  console.log(`🚀 CollabNote API running on port ${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api`);
}

export default bootstrap();