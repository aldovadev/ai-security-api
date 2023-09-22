import express from "express";
import helmet from "helmet";
import dotenv from "dotenv";
import cors from "cors";
import db from "./src/config/database.js";
dotenv.config();

const app = express();
app.use(helmet());

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:4200"],
  })
);

app.use(express.json());

const PORT = process.env.APP_PORT;

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
