import multer from "multer";
import mkdirp from "mkdirp";
import fs from "fs";
import visitorModel from "../models/visitorModel.js";
import employeeModel from "../models/employeeModel.js";

const visitorTargetPath = "resources/img/visitor";
const employeeTargetPath = "resources/img/visitor";

const storageVisitor = multer.diskStorage({
  destination: async (req, res, cb) => {
    if (!fs.existsSync(visitorTargetPath)) {
      try {
        await mkdirp(visitorTargetPath);
      } catch (err) {
        return cb(err, null);
      }
    }
    await cb(null, visitorTargetPath);
  },
  filename: async (req, file, cb) => {
    const visitorData = await visitorModel.findByPk(req.params.id);
    const fileName = visitorData.visit_number;
    await cb(null, `${fileName}.png`);
  },
});

const storageEmployee = multer.diskStorage({
  destination: async (req, res, cb) => {
    if (!fs.existsSync(employeeTargetPath)) {
      try {
        await mkdirp(employeeTargetPath);
      } catch (err) {
        return cb(err, null);
      }
    }
    await cb(null, employeeTargetPath);
  },
  filename: async (req, file, cb) => {
    const employeeData = await employeeModel.findByPk(req.params.id);
    const fileName = employeeData.employee_id;
    await cb(null, `${fileName}.png`);
  },
});

const uploadVisitor = multer({ storage: storageVisitor });

const uploadEmployee = multer({ storage: storageEmployee });

export { uploadVisitor, uploadEmployee, visitorTargetPath, employeeTargetPath };
