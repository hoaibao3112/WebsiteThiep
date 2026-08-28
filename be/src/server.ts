import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { apiRouter } from "./routes/api.router";
import "./queues/workers/mail.worker"; // Khởi động background worker xử lý gửi email bất đồng bộ

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép requests không có origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Static files for uploads
app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "Digital Card Platform API",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api", apiRouter);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled Error:", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Card Platform Backend Server is running at http://localhost:${PORT}`);
});

export default app;
