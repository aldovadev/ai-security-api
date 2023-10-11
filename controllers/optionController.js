import serviceModel from "../models/serviceModel.js";
import visitStatusModel from "../models/visitStatusModel.js";
import roleModel from "../models/roleModel.js";
import { InternalErrorHandler } from "../utils/errorHandler.js";

const getService = async (req, res) => {
  try {
    const serviceData = await serviceModel.findAll();
    res.status(200).send({ type: "Service data", data: serviceData });
  } catch (error) {
    res.status(500).send({ error: InternalErrorHandler(error) });
  }
};

const getRole = async (req, res) => {
  try {
    const roleData = await roleModel.findAll();
    res.status(200).send({ type: "Role data", data: roleData });
  } catch (error) {
    res.status(500).send({ error: InternalErrorHandler(error) });
  }
};

const getVisitStatus = async (req, res) => {
  try {
    const visitStatusData = await visitStatusModel.findAll();
    res.status(200).send({ type: "Visit status data", data: visitStatusData });
  } catch (error) {
    res.status(500).send({ error: InternalErrorHandler(error) });
  }
};

export { getService, getVisitStatus, getRole };
