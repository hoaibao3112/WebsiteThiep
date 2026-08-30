import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

export const logger = pino(
  {
    level: process.env.LOG_LEVEL || "info",
    // Production: JSON format cho log aggregators (Render, Datadog, Loki)
    // Development: pretty print với màu sắc
    ...(isProduction
      ? {}
      : {
          transport: {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "SYS:HH:MM:ss",
              ignore: "pid,hostname",
            },
          },
        }),
  }
);

export type Logger = typeof logger;
