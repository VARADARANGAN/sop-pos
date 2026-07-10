const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const notFound = require("./middlewares/notfound");

const routes = require("./routes");

const app = express();

/**
 * Security Middleware
 */
app.use(helmet());

/**
 * CORS Configuration
 */
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        "http://localhost:5173",
        process.env.FRONTEND_URL,
      ].filter(Boolean);

      const isAllowed = allowedOrigins.includes(origin) || 
                        /\.vercel\.app$/.test(origin) || 
                        /localhost:\d+$/.test(origin);

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

/**
 * Logging Middleware
 */
app.use(morgan("dev"));

/**
 * Body Parsers
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Cookie Parser
 */
app.use(cookieParser());

/**
 * Welcome Route
 */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to SOP Backend API",
    version: "v1",
  });
});

/**
 * API Routes
 */
app.use("/api/v1", routes);

app.use(notFound);

const errorHandler = require("./middlewares/errorHandler");

app.use(errorHandler);

module.exports = app;