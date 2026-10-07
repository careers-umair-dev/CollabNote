import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { Logger } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { NestExpressApplication } from "@nestjs/platform-express";

/**
 * Create and configure the NestJS application (CORS, middleware, Swagger).
 * Shared by the local server (bootstrap) and the Vercel serverless entry.
 */
export async function createApp(): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger("Bootstrap");

  // Enable CORS for all origins
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Middleware to log all incoming requests
  app.use((req: Request, res: Response, next: NextFunction) => {
    logger.log(`Incoming Request: ${req.method} ${req.url}`);
    next();
  });

  // Redirect `/` to `/api` only for root path
  app.use("/", (req: Request, res: Response, next: NextFunction) => {
    if (req.path === "/") {
      res.redirect("/api");
    } else {
      next();
    }
  });

  // Public URL of this API (used by the Swagger "Production server" entry)
  const productionUrl =
    process.env.PUBLIC_API_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://collabnote-fullstack-app.onrender.com");

  // Swagger Setup with Enhanced Metadata
  const swaggerConfig = new DocumentBuilder()
    .setTitle("CollabNote API")
    .setDescription(
      "Comprehensive API documentation for the CollabNote application, an intuitive collaborative notes platform.",
    )
    .setVersion("1.0.0")
    .addBearerAuth()
    .setContact(
      "Son Nguyen",
      "https://github.com/hoangsonww",
      "hoangson091104@gmail.com",
    )
    .setLicense("MIT", "https://opensource.org/licenses/MIT")
    .addServer(productionUrl, "Production server")
    .addServer("http://localhost:4000", "Development server")
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  // Set up Swagger documentation route
  const swaggerCdn = "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.18.2";
  SwaggerModule.setup("api", app, document, {
    customSiteTitle: "CollabNote API Documentation",
    // On Vercel (serverless) the Swagger UI static files cannot be served from
    // disk, so load them from a CDN instead.
    ...(process.env.VERCEL
      ? {
          customCssUrl: `${swaggerCdn}/swagger-ui.css`,
          customJs: [
            `${swaggerCdn}/swagger-ui-bundle.js`,
            `${swaggerCdn}/swagger-ui-standalone-preset.js`,
          ],
        }
      : {}),
  });

  return app;
}

/**
 * Bootstrap the NestJS application as a long-running server (local / Docker / Render)
 */
async function bootstrap() {
  const app = await createApp();
  const configService = app.get(ConfigService);
  const logger = new Logger("Bootstrap");

  // Start up the NestJS application
  const port = configService.get<number>("PORT", 4000);
  await app.listen(port, () => {
    logger.log(`NestJS Backend running on port ${port}`);
    logger.log(`Swagger API documentation available at /api`);
  });
}

// On Vercel the app is started per-request by api/index.js (see src/serverless.ts)
if (!process.env.VERCEL) {
  bootstrap();
}
