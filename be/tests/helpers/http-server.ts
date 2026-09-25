import express, { Express } from "express";
import cookieParser from "cookie-parser";
import { Server } from "http";
import { AddressInfo } from "net";
import { apiRouter } from "../../src/routes/api.router";
import { errorHandler } from "../../src/middlewares/error.middleware";

export interface TestHttpServer {
  app: Express;
  server: Server;
  baseUrl: string;
  close: () => Promise<void>;
}

export async function createTestHttpServer(customRouter = apiRouter): Promise<TestHttpServer> {
  const app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/api", customRouter);
  app.use(errorHandler);

  const server = await new Promise<Server>((resolve, reject) => {
    const s = app.listen(0, "127.0.0.1", () => resolve(s));
    s.on("error", reject);
  });

  const address = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}/api`;

  const close = () =>
    new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });

  return { app, server, baseUrl, close };
}
