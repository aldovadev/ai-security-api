import express from "express";
import helmet from "helmet";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import corsOptions from "./config/corsOptions.js";
import db from "./config/database.js";

//Import Routes
import userRoute from "./routes/userRoute.js";
import visitorRoute from "./routes/visitorRoute.js";
import employeeRoute from "./routes/employeeRoute.js";
import optionRoute from "./routes/optionRoute.js";

// Import table when create new table to sync
// import roleModel from "./models/roleModel.js";
// import serviceModel from "./models/serviceModel.js";
// import visitorModel from "./models/visitorModel.js";
// import userModel from "./models/userModel.js";
// import employeeModel from "./models/employeeModel.js";
// import visitStatusModel from "./models/visitStatusModel.js";

// Get ENV data
dotenv.config();

// Define app Express and module usage
const app = express();
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Sync database and check connetion
(async () => {
  await db.sync({});
  try {
    await db.authenticate();
    console.log("Database connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

// Using route from file routes
app.use(userRoute);
app.use(visitorRoute);
app.use(employeeRoute);
app.use(optionRoute);

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
