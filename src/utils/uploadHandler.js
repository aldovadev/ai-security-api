import multer from 'multer';
import mkdirp from 'mkdirp';
import fs from 'fs';
import visitorModel from '../models/visitor.model.js';
import employeeModel from '../models/employee.model.js';

const visitorTargetPath = 'resources/img/visitor';
const employeeTargetPath = 'resources/img/employee';
const recognizeTargetPath = 'resources/img/recognize';

const storageVisitor = multer.diskStorage({
    destination: async (req, res, cb) => {
        const visitorData = await visitorModel.findByPk(req.params.id);
        const destinationPath = `${visitorTargetPath}/${visitorData.destinationId}`;
        if (!fs.existsSync(destinationPath)) {
            try {
                await mkdirp(destinationPath);
            } catch (err) {
                return cb(err, null);
            }
        }
        await cb(null, destinationPath);
    },
    filename: async (req, file, cb) => {
        const visitorData = await visitorModel.findByPk(req.params.id);
        const fileName = visitorData.visitNumber;
        await cb(null, `${fileName}.png`);
    }
});

const storageEmployee = multer.diskStorage({
    destination: async (req, res, cb) => {
        const employeeData = await employeeModel.findByPk(req.params.id);
        const destinationPath = `${employeeTargetPath}/${employeeData.companyId}`;

        if (!fs.existsSync(destinationPath)) {
            try {
                await mkdirp(destinationPath);
            } catch (err) {
                return cb(err, null);
            }
        }
        await cb(null, destinationPath);
    },
    filename: async (req, file, cb) => {
        const employeeData = await employeeModel.findByPk(req.params.id);
        const fileName = employeeData.employeeId;
        await cb(null, `${fileName}.png`);
    }
});

const storageRecognize = multer.diskStorage({
    destination: async (req, res, cb) => {
        const companyId = req.id;
        const destinationPath = `${recognizeTargetPath}/${companyId}`;
        if (!fs.existsSync(destinationPath)) {
            try {
                await mkdirp(destinationPath);
            } catch (err) {
                return cb(err, null);
            }
        }
        await cb(null, destinationPath);
    },
    filename: async (req, file, cb) => {
        await cb(null, `incoming_photo.png`);
    }
});

const uploadVisitor = multer({ storage: storageVisitor });

const uploadEmployee = multer({ storage: storageEmployee });

const uploadRecognize = multer({ storage: storageRecognize });

export { uploadVisitor, uploadEmployee, visitorTargetPath, employeeTargetPath, uploadRecognize, recognizeTargetPath };
