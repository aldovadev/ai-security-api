import { Sequelize } from "sequelize";
import moment from "moment";
import db from "../config/database.js";
import visitorModel from "../models/visitorModel.js";
import visitorSchema from "../schemas/visitorSchema.js";
import { InternalErrorHandler } from "../utils/errorHandler.js";

const getVisitor = async (req, res) => {
  const visit_status = req.params.status;
  const company = req.company_name;

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
      data: visitorData,
    });
  } catch (error) {
    res.status(500).send({ error: InternalErrorHandler(error) });
  }
};

const createVisitor = async (req, res) => {
  const { error } = visitorSchema.validate(req.body);

  if (error) return res.status(400).send({ error: error.details[0].message });

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

  const visit_number = await generateVisitNumber();

  const recentDate = new Date();

  const photo_path =
    "/visitor/" +
    moment(recentDate).format("YY") +
    "/" +
    moment(recentDate).format("MM") +
    "/" +
    moment(recentDate).format("DD") +
    "/" +
    visit_number;

  const t = await db.transaction({
    isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE,
  });

  try {
    const newVisitor = await visitorModel.create(
      {
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
      },
      { transaction: t }
    );

    await t.commit();
    res
      .status(200)
      .send({ message: "Visitor created successfully", data: newVisitor });
  } catch (error) {
    if (t) t.rollback();
    res.status(500).send({ error: InternalErrorHandler(error) });
  }
};

const editVisitor = (req, res) => {
  res.send({ message: "Edit Visitor Endpoint" });
};

const deleteVisitor = (req, res) => {
  res.send({ message: "Delete Visitor Endpoint" });
};

const getVisitorProfile = async (req, res) => {
  const company = req.company_name;
  const id = req.params.id;

  try {
    const visitorProfile = await visitorModel.findOne({
      where: {
        company_destination: company,
        id: id,
      },
    });

    res.status(200).send({
      data: visitorProfile,
    });
  } catch (error) {
    res.status(500).send({
      error: InternalErrorHandler(error),
    });
  }
};

export {
  getVisitor,
  createVisitor,
  editVisitor,
  deleteVisitor,
  getVisitorProfile,
};

async function generateVisitNumber() {
  const recentDate = new Date();

  const lastVisitNumber = await visitorModel.findOne({
    order: [["created_at", "DESC"]],
  });

  let incrementedSeq = "00";

  if (lastVisitNumber !== null) {
    let lastAlphanumericSeq = lastVisitNumber.visit_number.substr(-2);
    incrementedSeq = (parseInt(lastAlphanumericSeq, 36) + 1)
      .toString(36)
      .toUpperCase();

    const firstSixDigits = lastVisitNumber.visit_number.substring(0, 6);

    if (
      incrementedSeq > "ZZ" ||
      firstSixDigits !== moment(recentDate).format("YYMMDD")
    )
      incrementedSeq = "00";
  }

  incrementedSeq = incrementedSeq.padStart(2, "0");
  const result = "VST" + moment(recentDate).format("YYMMDD") + incrementedSeq;

  return result;
}
