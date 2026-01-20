import dotenv from "dotenv";
// 1. Initialize dotenv FIRST
dotenv.config({
    path: "./.env" 
});

// 2. Then import app and other files that depend on process.env
import app from "./app.js";
import connectDB from "./db/database.js";

const port = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`✅ Server is running on port: ${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed", err);
  });