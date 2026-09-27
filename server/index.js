// Must be the first import: ESM evaluates imports before this module's body,
// so config (e.g. JWT_SECRET) read at import time needs the env loaded already.
import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import { connectDB } from "./src/config/db.js";
import { bootstrapData } from "./src/config/bootstrap.js";
import { errorHandler, notFoundHandler } from "./src/middleware/errorHandler.js";
import authRoutes from "./src/routes/auth.routes.js";
import reportRoutes from "./src/routes/report.routes.js";
import investigationRoutes from "./src/routes/investigation.routes.js";
import alertRoutes from "./src/routes/alert.routes.js";
import clusterRoutes from "./src/routes/cluster.routes.js";
import dashboardRoutes from "./src/routes/dashboard.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import categoryRoutes from "./src/routes/category.routes.js";
import auditRoutes from "./src/routes/audit.routes.js";
import notificationRoutes from "./src/routes/notification.routes.js";

const app = express();
const server = http.createServer(app);
// 5000 is taken by AirPlay Receiver on macOS
const PORT = process.env.PORT || 5050;

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/investigations", investigationRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/clusters", clusterRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "HEALTHY",
    system: "Tripoli Smart Public Health Surveillance & Reporting Server",
    city: "Tripoli, Lebanon",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", notFoundHandler);
app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  try {
    await connectDB();
    await bootstrapData();
  } catch (error) {
    console.error(`[Startup] Could not connect to MongoDB: ${error.message}`);
    process.exit(1);
  }

  server.on("error", (error) => {
    console.error(`[Startup] Cannot listen on port ${PORT}: ${error.message}`);
    process.exit(1);
  });
  server.listen(PORT, () => {
    console.log(`[Tripoli HealthPulse Server] Running on port ${PORT}`);
  });
}

export default app;
