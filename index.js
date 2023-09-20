import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

(async () => {
  await db.sync();
})();

app.use(express.json());

store.sync();

app.listen(process.env.APP_PORT, () => {
  console.log("Server is running ");
});
