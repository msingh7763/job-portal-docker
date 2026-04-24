import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import http from "http";
import path from "path";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import { Server } from "socket.io";

import connectDB from "./utils/db.js";
import userRoute from "./routes/user.routes.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import { Company } from "./models/company.model.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.resolve(__dirname, "..", "Frontend", "dist");
const hasFrontendBuild = existsSync(frontendDistPath);

const app = express();
const server = http.createServer(app);

/* ================= SOCKET.IO ================= */
const allowedOrigins = (
  process.env.CORS_ORIGINS ||
  "http://localhost:5173,http://localhost:5174,http://localhost:5175,https://job-portal-pearl-omega.vercel.app"
)
  .split(",")
  .map((origin) => origin.trim());

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

app.set("io", io);

/* ================= MIDDLEWARE ================= */
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ================= SECURITY ================= */
app.use(helmet());
app.set("trust proxy", 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100,
});
app.use(limiter);

/* ================= CORS ================= */
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        return callback(null, true);
      }
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("CORS blocked origin:", origin);
        // Don't block in production - just log it
        // This allows development flexibility
        callback(null, true); 
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400, // 24 hours
  })
);

/* ================= ROUTES ================= */

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    message: "Job Portal backend is running 🚀",
    success: true,
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api/users", userRoute);
app.use("/api/company", companyRoute);
app.use("/api/job", jobRoute);
app.use("/api/application", applicationRoute);

if (hasFrontendBuild) {
  app.use(express.static(frontendDistPath));

  // SPA fallback: serve React entry for all non-API routes.
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

/* ================= ERROR HANDLING ================= */
app.use(notFound);
app.use(errorHandler);

/* ================= SOCKET CONNECTION ================= */
io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

/* ================= GLOBAL ERROR HANDLING ================= */
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

/* ================= START SERVER ================= */
const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB connected");

    // Fix old index issue
    try {
      await Company.collection.dropIndex("name_1");
      console.log("🧹 Dropped old index (name_1)");
    } catch (err) {
      if (err?.codeName !== "IndexNotFound") {
        console.warn("Index drop warning:", err.message);
      }
    }

    await Company.syncIndexes();

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ DB Connection Failed:", error.message);
    process.exit(1);
  }
};

startServer();