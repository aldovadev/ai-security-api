import express from "express";
import helmet from "helmet";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import db from "./src/config/database.js";

//Import Routes
import AuthRoute from "./src/routes/authRoute.js";

//Get ENV data
dotenv.config();

//Define app Express and module usage
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Sync DB to check connetion
(async () => {
  try {
    await db.sync();
    console.log("Database connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

// Using route from file routes
app.use(AuthRoute);

// Default get endpoint route
app.get("/", async (req, res) => {
  res.json({
    status: "Server ASA is running!",
  });
});

// Get data APP_PORT from .env
const PORT = process.env.APP_PORT || 8080;

// Listening to PORT
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
