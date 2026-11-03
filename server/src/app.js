import express from "express";
import cors from "cors";
import taskRoutes from "./routes/taskRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const app = express();
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173").split(",").map(v => v.trim());
app.use(cors({ origin(origin, callback) {
  if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) return callback(null, true);
  return callback(new Error("Not allowed by CORS"));
} }));
app.use(express.json({ limit: "1mb" }));
app.get("/api/health", (req, res) => res.json({ status: "ok", service: "taskflow-api" }));
app.use("/api/tasks", taskRoutes);
app.use(notFound);
app.use(errorHandler);
export default app;
