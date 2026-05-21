const Sentry = require("./config/sentry");
const connectDB = require("./config/db");
const validateEnv = require("./config/env");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const logger = require("./utils/logger");
const compression = require("compression");
const cookieParser = require("cookie-parser");

//RATE LIMIT
const {
  apiLimiter,
  aiLimiter,
  authLimiter,
} = require("./middleware/rateLimit.middleware");
require("dotenv").config();

// SANITIZATION
const sanitize = require("./middleware/sanitize.middleware");
const aiProtect = require("./middleware/aiProtect.middleware");

// Initialize app
const app = express();

// Security headers
app.use(helmet());

// Enable CORS (frontend connection)
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://your-production-domain.com",
    ],
    credentials: true,
  })
);

// PAYSTACK WEBHOOK RAW BODY
app.use(
  "/api/v1/webhooks/paystack",
  express.raw({ type: "application/json" })
);

// Flutterwave + PayPal (normal JSON)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Logging
app.use(morgan("dev"));

// Compression (performance boost)
app.use(compression());

// SANITIZATION (GLOBAL)
sanitize(app);

// RATE LIMITING (GLOBAL)
app.use(apiLimiter);

// AI PROTECTION (AI ONLY)
app.use("/api/v1/ai", aiLimiter, aiProtect);

// BASE ROUTE
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Scholar Next AI Backend is running",
  });
});

// API ROUTES BASE

// Auth routes
app.use("/api/v1/auth", require("./routes/auth.routes"));

// AI routes (tutor, pdf, quiz, etc.)
app.use("/api/v1/ai", require("./routes/ai.routes"));
app.use("/api/v1/ai", aiLimiter);

// Payment routes
app.use("/api/v1/payments", require("./routes/payment.routes"));

//quiz routes
app.use(
  "/api/v1/quiz",
  require(
    "./routes/quiz.routes"
  )
);

//REGISTER LEARNING ROUTES
app.use(
  "/api/v1/learning",
  require(
    "./routes/learning.routes"
  )
);

// WEBHOOKS ROUTES
app.use(
  "/api/v1/webhooks",
  require("./routes/webhook.routes")
);

// ERROR HANDLING

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  //log locally
  logger.error(err.stack);
//send to santry
  Sentry.captureException(err);
//respond to client
  res.status(500).json({
    success: false,
    message: "Server Error",
    error: err.message,
  });
});

// START SERVER
const PORT = process.env.PORT || 5000;

validateEnv();
connectDB();

app.listen(PORT, () => {
  const logger = require("./utils/logger");

logger.info(
  `Scholar Next AI server running on port ${PORT}`
);
});