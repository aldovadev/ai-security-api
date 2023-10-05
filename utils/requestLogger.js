import moment from "moment";
import { v4 as uuid } from "uuid";
import fs from "fs";
import { promises as fsPromises } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logEvents = async (message, logName) => {
  const dateTime = moment().format("YYYYMMDD\tHH:mm:ss");
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

  try {
    if (!fs.existsSync(join(__dirname, "..", "logs"))) {
      await fsPromises.mkdir(join(__dirname, "..", "logs"));
    }

    await fsPromises.appendFile(
      join(__dirname, "..", "logs", logName),
      logItem
    );
  } catch (err) {
    console.error(err);
  }
};

const logger = (req, res, next) => {
  logEvents(
    `${req.method}\t${req.headers.origin}\t${req.url}`,
    "requestLog.txt"
  );
  next();
};

export default logger;
