import express from "express";
import helmet from "helmet";
import dotenv from "dotenv";
import cors from "cors";
// import db from "./src/config/database.js";

dotenv.config();

const app = express();
app.use(helmet());

// (async () => {
//   try {
//     await db.sync();
//     await db.authenticate();
//     console.log("Database connection has been established successfully.");
//   } catch (error) {
//     console.error("Unable to connect to the database:", error);
//   }
// })();

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:4200"],
  })
);

app.use(express.json());

const PORT = process.env.APP_PORT || 8080;

app.get("/", async (req, res) => {
  res.json({ status: "Server ASA is running!" });
});

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
