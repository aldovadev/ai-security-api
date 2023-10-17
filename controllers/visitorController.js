import { Op } from "sequelize";
import moment from "moment";
import visitorModel from "../models/visitorModel.js";
import userModel from "../models/userModel.js";
import {
  createVisitorSchema,
  editStatusSchema,
} from "../schemas/visitorSchema.js";
import InternalErrorHandler from "../utils/errorHandler.js";
import { visitorTargetPath } from "../utils/uploadHandler.js";
import fs from "fs";
import mkdirp from "mkdirp";
import dotenv from "dotenv";
import { Storage } from "@google-cloud/storage";
import axios from "axios";
import path from "path";
import FormData from "form-data";

dotenv.config();

const uploadVisitorImage = async (req, res) => {
  const bucketName = "asa-file-storage";
  const keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const imageUrl = process.env.IMAGE_URL;

  const visitorId = req.params.id;
  const visitorData = await visitorModel.findByPk(visitorId);

  const location = `${visitorTargetPath}/${visitorData.visit_number}.png`;

  const storage = new Storage({ keyFilename });
  const bucket = storage.bucket(bucketName);

  const uploadedName = `${visitorData.visit_number}.png`;
  const destination = `${visitorData.photo_path}/${uploadedName}`;

  try {
    visitorData.photo_path = destination;
    await visitorData.save();

    await bucket.upload(location, {
      destination: destination,
      metadata: {
        cacheControl: "public, max-age=31536000",
      },
    });
    await fs.unlinkSync(location);

    return res.status(200).send({
      message: "Success uploading visitor image",
      status: "done",
      url: `${imageUrl}/${destination}`,
    });
  } catch (error) {
    return res.status(500).send({
      message: "Failed uploading visitor image",
      error: error,
    });
  }
};

const changeVisitorImage = async (req, res) => {
  const bucketName = "asa-file-storage";
  const keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const imageUrl = process.env.IMAGE_URL;

  const visitorId = req.params.id;
  const visitorData = await visitorModel.findByPk(visitorId);

  const location = `${visitorTargetPath}/${visitorData.visit_number}.png`;

  const storage = new Storage({ keyFilename });
  const bucket = storage.bucket(bucketName);

  const destination = visitorData.photo_path;

  try {
    await bucket.upload(location, {
      destination: destination,
      metadata: {
        cacheControl: "public, max-age=31536000",
      },
    });

    await fs.unlinkSync(location);

    return res.status(200).send({
      message: "Success change visitor image",
      status: "done",
      url: `${imageUrl}/${destination}`,
    });
  } catch (error) {
    return res.status(500).send({
      message: "Failed change visitor image",
      error: error,
    });
  }
};

const getVisitor = async (req, res) => {
  const { visit_status, company } = req.body;

  try {
    let visitorData;

    if (visit_status === "All")
      visitorData = await visitorModel.findAll({
        where: {
          company_destination: company,
        },
      });
    else {
      visitorData = await visitorModel.findAll({
        where: {
          company_destination: company,
          visit_status: visit_status,
        },
      });
    }

    res.status(200).send({
      message: `Get ${visit_status} visitor`,
      status: "success",
      company: company,
      data: visitorData,
    });
  } catch (error) {
    res.status(500).send({
      message: "Server failed to process this request",
      error: InternalErrorHandler(error),
    });
  }
};

const createVisitorDetail = async (req, res) => {
  const { error } = createVisitorSchema.validate(req.body);

  if (error)
    return res
      .status(400)
      .send({ message: error.details[0].message, error: "bad request" });

  const {
    name,
    email,
    phone_number,
    gender,
    address,
    company_origin,
    company_destination,
    start_date,
    end_date,
    visit_reason,
  } = req.body;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const todayData = await visitorModel.findOne({
    where: {
      email: email,
      company_destination: company_destination,
      created_at: {
        [Op.between]: [today, tomorrow],
      },
    },
  });

  if (todayData)
    return res.status(400).send({
      message: `You already create request to visit ${company_destination} today`,
      error: "bad request",
    });

  const now = new Date();
  const visit_number = await generateVisitNumber(now);
  const photo_path =
    "visitor/" +
    moment(now).format("YY") +
    "/" +
    moment(now).format("MM") +
    "/" +
    moment(now).format("DD") +
    "/" +
    visit_number;

  try {
    const newVisitor = await visitorModel.create({
      name: name,
      email: email,
      phone_number: phone_number,
      gender: gender,
      address: address,
      company_origin: company_origin,
      company_destination: company_destination,
      start_date: start_date,
      end_date: end_date,
      visit_reason: visit_reason,
      visit_number: visit_number,
      visit_status: "Incoming",
      photo_path: photo_path,
    });

    res.status(200).send({
      message: "Visitor has been created",
      status: "success",
      data: newVisitor,
    });
  } catch (error) {
    res.status(500).send({
      message: "Server failed to process this request",
      error: InternalErrorHandler(error),
    });
  }
};

const editVisitorDetail = async (req, res) => {
  const { error } = createVisitorSchema.validate(req.body);

  if (error)
    return res
      .status(400)
      .send({ message: error.details[0].message, error: "bad request" });

  const visitorId = req.params.id;

  const {
    name,
    email,
    phone_number,
    gender,
    address,
    company_origin,
    company_destination,
    start_date,
    end_date,
    visit_reason,
  } = req.body;

  try {
    const visitorData = await visitorModel.findByPk(visitorId);

    if (!visitorData) {
      return res.status(404).send({
        message: `Visitor with id ${visitorId} found`,
        error: "not found",
      });
    }

    visitorData.name = name;
    visitorData.email = email;
    visitorData.phone_number = phone_number;
    visitorData.gender = gender;
    visitorData.address = address;
    visitorData.company_origin = company_origin;
    visitorData.company_destination = company_destination;
    visitorData.start_date = start_date;
    visitorData.end_date = end_date;
    visitorData.visit_reason = visit_reason;

    await visitorData.save();

    res.status(200).send({
      message: `Visitor with id ${visitorId} has been updated`,
      status: "success",
      data: visitorData,
    });
  } catch (error) {
    res.status(500).send({
      message: "Server failed to process this request",
      error: InternalErrorHandler(error),
    });
  }
};

const deleteVisitor = async (req, res) => {
  const visitorId = req.params.id;

  const visitorData = await visitorModel.findByPk(visitorId);

  if (!visitorData) {
    return res.status(404).send({
      message: `Visitor with id ${visitorId} found`,
      error: "not found",
    });
  }

  const destination = visitorData.photo_path;

  const bucketName = "asa-file-storage";
  const keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const storage = new Storage({ keyFilename });
  const bucket = storage.bucket(bucketName);

  try {
    await visitorData.destroy();
    await bucket.file(destination).delete();

    res.status(200).send({
      message: `Visitor with id ${visitorId} has been deleted`,
      status: "success",
    });
  } catch (error) {
    res.status(500).send({
      message: "Server failed to process this request",
      error: InternalErrorHandler(error),
    });
  }
};

const getVisitorProfile = async (req, res) => {
  const visitorId = req.params.id;

  try {
    const visitorProfile = await visitorModel.findByPk(visitorId);

    res.status(200).send({
      message: "Get visitor profile success",
      data: visitorProfile,
    });
  } catch (error) {
    res.status(500).send({
      message: "Server failed to process this request",
      error: InternalErrorHandler(error),
    });
  }
};

const setupVisitorToday = async (req, res) => {
  const email = req.email;

  const userData = await userModel.findOne({
    where: {
      email: email,
    },
    attributes: {
      exclude: ["password", "refresh_token"],
    },
  });

  if (
    userData.url === "null" ||
    userData.url === null ||
    userData.url === undefined
  )
    return res.status(500).send({
      message: "Endpoint url for data training is not exist or null",
      status: "internal server error",
    });

  await axios.delete(`${userData.url}/visitor/reset`);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const visitorData = await visitorModel.findAll({
    where: {
      company_destination: userData.company_name,
      visit_status: "Accepted",
      start_date: {
        [Op.between]: [today, tomorrow],
      },
    },
  });

  try {
    const arrayImagePath = await visitorData.map((obj) => obj.photo_path);
    const responseTrain = await trainImageToPythonServer(
      arrayImagePath,
      userData.url
    );

    res.status(200).send({
      message: "Success updating trained data for today",
      status: "success",
      data: responseTrain,
    });
  } catch (error) {
    res.status(500).send({
      message: "Failed updating trained data for today",
      status: "internal server error",
    });
  }
};

const changeVisitorStatus = async (req, res) => {
  const { error } = editStatusSchema.validate(req.body);

  if (error)
    return res
      .status(400)
      .send({ message: error.details[0].message, error: "bad request" });

  const { id, visit_status } = req.body;

  try {
    const visitorData = await visitorModel.findByPk(id);
    visitorData.visit_status = visit_status;

    await visitorData.save();

    res.status(200).send({
      message: `Visit status visitor with id ${id} has been updated`,
      status: "success",
    });
  } catch (error) {
    res.status(500).send({
      message: "Server failed to process this request",
      error: InternalErrorHandler(error),
    });
  }
};

export {
  getVisitor,
  createVisitorDetail,
  editVisitorDetail,
  deleteVisitor,
  getVisitorProfile,
  setupVisitorToday,
  changeVisitorImage,
  uploadVisitorImage,
  changeVisitorStatus,
};

async function generateVisitNumber(now) {
  const lastVisitNumber = await visitorModel.findOne({
    order: [["created_at", "DESC"]],
  });

  let incrementedSeq = "00";

  if (lastVisitNumber !== null) {
    const lastAlphanumericSeq = lastVisitNumber.visit_number.substr(-2);
    incrementedSeq = (parseInt(lastAlphanumericSeq, 36) + 1)
      .toString(36)
      .toUpperCase();

    const firstSixDigits = lastVisitNumber.visit_number.substring(0, 8);

    if (
      incrementedSeq > "ZZ" ||
      firstSixDigits !== moment(now).format("YYYYMMDD")
    )
      incrementedSeq = "00";
  }

  incrementedSeq = incrementedSeq.padStart(2, "0");
  const result = moment(visitDate).format("YYYYMMDD") + "VST" + incrementedSeq;

  return result;
}

async function trainImageToPythonServer(pathImageArray, endpoint) {
  const bucketName = "asa-file-storage";
  const keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const storage = new Storage({ keyFilename });

  const bucket = storage.bucket(bucketName);

  let totalImage = [];

  if (!fs.existsSync(visitorTargetPath)) await mkdirp(visitorTargetPath);

  for (let pathImage of pathImageArray) {
    const filename = path.basename(pathImage);
    const visit_number = filename.split(".")[0];
    const destinationPath = `${visitorTargetPath}/${filename}`;

    await bucket
      .file(pathImage)
      .createReadStream()
      .pipe(fs.createWriteStream(destinationPath))
      .on("finish", async () => {
        const formData = new FormData();
        formData.append("file", fs.createReadStream(destinationPath));

        const r = await axios.post(
          `${endpoint}/visitor/add?name=${visit_number}`,
          formData,
          {
            headers: {
              ...formData.getHeaders(),
              accept: "application/json",
            },
          }
        );

        await fs.unlinkSync(destinationPath);
      });
    totalImage.push({ visit_number: visit_number, status: "success" });
  }

  return totalImage;
}
