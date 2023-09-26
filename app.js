import express from "express";
import helmet from "helmet";
import dotenv from "dotenv";
import cors from "cors";
import db from "./src/config/database.js";

dotenv.config();

const app = express();
app.use(helmet());

(async () => {
  try {
    await db.sync();
    await db.authenticate();
    console.log("Database connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:4200"],
  })
);

app.use(express.json());

const PORT = process.env.APP_PORT || 8080;

app.get("/", async (req, res) => {
  res.json({
    status: "Server ASA is running!",
  });
});

app.get("/db-status", async (req, res) => {
  (async () => {
    try {
      await db.sync();
      await db.authenticate();
      res.json({
        status: "Database connection has been established successfully.",
      });
      console.log(
        "status: Database connection has been established successfully"
      );
    } catch (error) {
      res.json({
        error: error,
      });
      console.error("error:", error);
    }
  })();
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
