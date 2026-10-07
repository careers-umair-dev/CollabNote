// Vercel serverless entry. Not used when running locally (see main.ts).
//
// NestJS loads some packages dynamically (by name at runtime), which Vercel's
// file tracing cannot see. Importing them explicitly makes sure they are
// included in the deployed function.
import "@nestjs/platform-express";
import "@apollo/server";

import type { IncomingMessage, ServerResponse } from "http";
import { createApp } from "./main";

type ExpressHandler = (req: IncomingMessage, res: ServerResponse) => void;

// Cached between invocations of a warm function to avoid re-bootstrapping Nest
let cachedHandler: Promise<ExpressHandler> | undefined;

async function getHandler(): Promise<ExpressHandler> {
  const app = await createApp();
  await app.init();
  return app.getHttpAdapter().getInstance() as ExpressHandler;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  if (!cachedHandler) {
    cachedHandler = getHandler();
    // If bootstrapping fails, don't cache the failure forever
    cachedHandler.catch(() => {
      cachedHandler = undefined;
    });
  }
  const expressHandler = await cachedHandler;
  return expressHandler(req, res);
}
