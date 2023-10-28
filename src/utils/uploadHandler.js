import multer from 'multer';
import mkdirp from 'mkdirp';
import fs from 'fs';
import visitorModel from '../models/visitor.model.js';
import employeeModel from '../models/employee.model.js';

const visitorTargetPath = 'resources/img/visitor';
const employeeTargetPath = 'resources/img/employee';

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

const uploadVisitor = multer({ storage: storageVisitor });

const uploadEmployee = multer({ storage: storageEmployee });

export { uploadVisitor, uploadEmployee, visitorTargetPath, employeeTargetPath };
