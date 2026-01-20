import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();


// 1. Basic Logging to see what's happening
app.use((req, res, next) => {
    console.log(`DEBUG: ${req.method} request received at ${req.url}`);
    next();
});

// 2. Standard Middlewares
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// 3. CORS - Modified to support http
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true
}));

// 4. Routes
import healthCheckRouter from "./routes/healthcheck.routes.js";
import authRouter from "./routes/auth.routes.js";

app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth", authRouter);
// app.js


app.get('/', (req, res) => {
    res.send('Hello World!');
});

export default app;