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
import axios from "axios";
import path from "path";
import FormData from "form-data";
import { v4 as uuid } from "uuid";
import visitStatusModel from "../models/visitStatusModel.js";
import bucket from "../utils/storageHandler.js";

dotenv.config();

const uploadVisitorImage = async (req, res) => {
  const imageUrl = process.env.IMAGE_URL;
  const visitorId = req.params.id;

  try {
    const visitorData = await visitorModel.findByPk(visitorId);

    const location = `${visitorTargetPath}/${visitorData.destinationId}/${visitorData.visitNumber}.png`;
    const destination = `${visitorData.photoPath}/${visitorData.visitNumber}.png`;

    visitorData.photoPath = destination;
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
  const imageUrl = process.env.IMAGE_URL;
  const visitorId = req.params.id;

  try {
    const visitorData = await visitorModel.findByPk(visitorId);
    const location = `${visitorTargetPath}/${visitorData.destinationId}/${visitorData.visitNumber}.png`;
    const destination = visitorData.photoPath;

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
  const queryData = req.query;

  try {
    const statusData = await visitStatusModel.findOne({
      where: {
        statusName: {
          [Op.iLike]: queryData.status,
        },
      },
    });

    if (!statusData)
      return res
        .status(404)
        .send({ message: "Status is not found", error: "status invalid" });

    const userData = await userModel.findOne({
      where: {
        email: req.email,
      },
    });

    if (!userData)
      return res
        .status(404)
        .send({ message: "Email is not found", error: "email invalid" });

    let visitorData;

    if (queryData.status === "all") {
      visitorData = await visitorModel.findAll({
        where: { destinationId: userData.id },
      });
    } else {
      visitorData = await visitorModel.findAll({
        where: {
          destinationId: userData.id,
          statusId: statusData.statusId,
        },
      });
    }

    res.status(200).send({
      message: `Get visitor data success`,
      status: "success",
      company: userData.companyName,
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

  const visitorData = req.body;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  try {
    const todayData = await visitorModel.findOne({
      where: {
        email: visitorData.email,
        destinationId: visitorData.destinationId,
        createdAt: {
          [Op.between]: [today, tomorrow],
        },
      },
    });

    if (todayData)
      return res.status(400).send({
        message: `You already make a visit request today`,
        error: "bad request",
      });

    const userData = await userModel.findByPk(visitorData.destinationId);
    const now = new Date();
    const visitNumber = await generateVisitNumber(now);
    const photoPath =
      "visitor/" +
      userData.id +
      "/" +
      moment(now).format("YY") +
      "/" +
      moment(now).format("MM") +
      "/" +
      moment(now).format("DD") +
      "/" +
      visitNumber;

    const newVisitor = await visitorModel.create({
      id: uuid(),
      name: visitorData.name,
      email: visitorData.email,
      phoneNumber: visitorData.phoneNumber,
      gender: visitorData.gender,
      address: visitorData.address,
      startDate: visitorData.startDate,
      endDate: visitorData.endDate,
      visitReason: visitorData.visitReason,
      visitNumber: visitNumber,
      originId: visitorData.originId,
      destinationId: visitorData.destinationId,
      statusId: 1001,
      photoPath: photoPath,
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
  const visitorId = req.params.id;
  const updateVisitorData = req.body;

  try {
    const visitorData = await visitorModel.findByPk(visitorId);

    if (!visitorData) {
      return res.status(404).send({
        message: `Visitor with this id found`,
        error: "not found",
      });
    }

    if (updateVisitorData.destinationId) {
      const newPhotoPath = await visitorData.photoPath.replace(
        /\/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}\//,
        `/${updateVisitorData.destinationId}/`
      );
      console.log(visitorData.photoPath);
      console.log(newPhotoPath);
      await bucket.file(visitorData.photoPath).move(newPhotoPath);
      updateVisitorData.photoPath = newPhotoPath;
    }

    await visitorData.update(updateVisitorData);

    res.status(200).send({
      message: `Visitor with this id has been updated`,
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
  const mlUrl = process.env.ML_URL;

  const visitorData = await visitorModel.findByPk(visitorId);

  if (!visitorData) {
    return res.status(404).send({
      message: `Visitor with this id found`,
      error: "not found",
    });
  }

  const startDate = new Date(visitorData.startDate);
  const now = new Date();

  try {
    if (startDate.getDate() === now.getDate()) {
      await axios.delete(
        `${mlUrl}/visitor/delete?company_id=${visitorData.destinationId}&visit_number=${visitorData.visitNumber}`
      );
    }
    await bucket.file(visitorData.photoPath).delete();
    await visitorData.destroy();

    res.status(200).send({
      message: `Visitor with this id has been deleted`,
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
  const imageUrl = process.env.IMAGE_URL;

  try {
    const visitorProfile = await visitorModel.findByPk(visitorId);

    res.status(200).send({
      message: "Get visitor profile success",
      data: visitorProfile,
      url: `${imageUrl}/${visitorProfile.photoPath}`,
    });
  } catch (error) {
    res.status(500).send({
      message: "Server failed to process this request",
      error: InternalErrorHandler(error),
    });
  }
};

const setupVisitorToday = async (req, res) => {
  const mlUrl = process.env.ML_URL;
  try {
    const userData = await userModel.findOne({
      where: {
        email: req.email,
      },
    });

    await axios.delete(`${mlUrl}/visitor/reset?company_id=${userData.id}`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const visitorData = await visitorModel.findAll({
      where: {
        destinationId: userData.id,
        statusId: 1002,
        startDate: {
          [Op.between]: [today, tomorrow],
        },
      },
    });

    if (!visitorData)
      return res.status(500).send({
        message: "No data to train for today",
        status: "internal server error",
      });

    const responseTrain = await trainImageToPythonServer(visitorData);

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

  const updateStatusData = req.body;

  try {
    const visitorData = await visitorModel.findByPk(updateStatusData.id);

    if (updateStatusData.status === 1003 || updateStatusData.status === 1004) {
    }

    visitorData.statusId = updateStatusData.statusId;

    await visitorData.save();

    res.status(200).send({
      message: `Visit status visitor with this id has been updated`,
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
  const lastVisitor = await visitorModel.findOne({
    order: [["createdAt", "DESC"]],
  });

  let incrementedSeq = "00";

  if (lastVisitor !== null) {
    const lastAlphanumericSeq = lastVisitor.visitNumber.substr(-2);
    incrementedSeq = (parseInt(lastAlphanumericSeq, 36) + 1)
      .toString(36)
      .toUpperCase();

    const firstSixDigits = lastVisitor.visitNumber.substring(0, 8);

    if (
      incrementedSeq > "ZZ" ||
      firstSixDigits !== moment(now).format("YYYYMMDD")
    )
      incrementedSeq = "00";
  }

  incrementedSeq = incrementedSeq.padStart(2, "0");
  const result = moment(now).format("YYYYMMDD") + "VST" + incrementedSeq;

  return result;
}

async function trainImageToPythonServer(visitorData) {
  const totalTrain = [];
  const mlUrl = process.env.ML_URL;

  const promises = visitorData.map(async (data) => {
    const filename = path.basename(data.photoPath);
    if (!fs.existsSync(`${visitorTargetPath}/${data.destinationId}`))
      await mkdirp(`${visitorTargetPath}/${data.destinationId}`);

    const destinationPath = `${visitorTargetPath}/${data.destinationId}/${filename}`;

    return new Promise((resolve, reject) => {
      bucket
        .file(data.photoPath)
        .createReadStream()
        .pipe(fs.createWriteStream(destinationPath))
        .on("finish", async () => {
          const formData = new FormData();
          formData.append("file", fs.createReadStream(destinationPath));

          try {
            const r = await axios.post(
              `${mlUrl}/visitor/add?company_id=${data.destinationId}&visit_number=${data.visitNumber}`,
              formData,
              {
                headers: {
                  ...formData.getHeaders(),
                  accept: "application/json",
                },
              }
            );

            await fs.unlinkSync(destinationPath);
            totalTrain.push(r.data);
            resolve(r.data);
          } catch (error) {
            reject(error);
          }
        });
    });
  });

  const results = await Promise.all(promises);

  return results;
}
