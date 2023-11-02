import employeeModel from '../models/employee.model.js';
import employeeSchema from '../schemas/employee.schema.js';
import InternalErrorHandler from '../utils/errorHandler.js';
import { v4 as uuid } from 'uuid';
import { employeeTargetPath } from '../utils/uploadHandler.js';
import bucket from '../utils/storageHandler.js';
import { trainImageEmployee } from '../utils/trainerHandler.js';
import fs from 'fs';
import userModel from '../models/user.model.js';
import axios from 'axios';

const createEmployeeDetail = async (req, res) => {
    const { error } = employeeSchema.validate(req.body);

    if (error) return res.status(400).send({ message: error.details[0].message, error: 'bad request' });

    const employeeData = req.body;

    try {
        const newEmployee = await employeeModel.create({
            id: uuid(),
            name: employeeData.name,
            email: employeeData.email,
            phoneNumber: employeeData.phoneNumber,
            gender: employeeData.gender,
            position: employeeData.position,
            address: employeeData.address,
            companyId: employeeData.companyId,
            employeeId: employeeData.employeeId
        });

        res.status(200).send({
            message: 'Employee created successfully',
            status: 'success',
            data: newEmployee
        });
    } catch (error) {
        res.status(500).send({
            message: 'Server failed to process this request',
            error: InternalErrorHandler(error)
        });
    }
};

const editEmployeeDetail = async (req, res) => {
    const id = req.params.id;
    const updateEmployeeData = req.body;

    try {
        const employeeData = await employeeModel.findByPk(id);

        if (!employeeData)
            return res.status(404).send({
                message: `Employee with this id not found`,
                error: 'not found'
            });

        await employeeData.update(updateEmployeeData);

        res.status(200).send({
            message: `Employee with this id has been updated`,
            status: 'success',
            data: employeeData
        });
    } catch (error) {
        res.status(500).send({
            message: 'Server failed to process this request',
            error: InternalErrorHandler(error)
        });
    }
};

const uploadEmployeeImage = async (req, res) => {
    const imageUrl = process.env.IMAGE_URL;
    const id = req.params.id;

    try {
        const employeeData = await employeeModel.findByPk(id);
        const location = `${employeeTargetPath}/${employeeData.companyId}/${employeeData.employeeId}.png`;
        const destination = `employee/${employeeData.companyId}/${employeeData.employeeId}.png`;
        employeeData.photoPath = destination;

        await bucket.upload(location, {
            destination: destination,
            metadata: {
                cacheControl: 'public, max-age=31536000'
            }
        });

        const trainResult = await trainImageEmployee(employeeData);
        await employeeData.save();
        await fs.unlinkSync(location);

        return res.status(200).send({
            message: 'Success uploading employee image',
            status: 'done',
            url: `${imageUrl}/${destination}`,
            detail: trainResult.data
        });
    } catch (error) {
        return res.status(500).send({
            message: 'Failed uploading employee image',
            error: error
        });
    }
};

const getEmployee = async (req, res) => {
    try {
        const userData = await userModel.findByPk(req.params.id);
        const employeeData = await employeeModel.findAll({
            where: {
                companyId: req.params.id
            },
            include: [
                {
                    model: userModel,
                    as: 'company',
                    attributes: ['companyName']
                }
            ]
        });

        res.status(200).send({
            message: 'Get employee data success',
            company: userData.companyName,
            data: employeeData
        });
    } catch (error) {
        res.status(500).send({
            message: 'Server failed to process this request',
            error: InternalErrorHandler(error)
        });
    }
};

const deleteEmployee = async (req, res) => {
    const mlUrl = process.env.ML_URL;

    try {
        const employeeData = await employeeModel.findByPk(req.params.id);

        if (!employeeData)
            return res.status(404).send({
                message: `Employee with this id not found`,
                error: 'not found'
            });

        if (employeeData.photoPath) {
            await axios.delete(`${mlUrl}/employee/delete?company_id=${employeeData.companyId}&employee_id=${employeeData.employeeId}`);
            await bucket.file(employeeData.photoPath).delete();
        }
        await employeeData.destroy();

        res.status(200).send({
            message: `Employee with this id has been deleted`,
            status: 'success'
        });
    } catch (error) {
        res.status(500).send({
            message: 'Server failed to process this request',
            error: InternalErrorHandler(error)
        });
    }
};

const getEmployeeProfile = async (req, res) => {
    const imageUrl = process.env.IMAGE_URL;

    try {
        const employeeProfile = await employeeModel.findByPk(req.params.id, {
            include: [
                {
                    model: userModel,
                    as: 'company',
                    attributes: ['companyName']
                }
            ]
        });

        if (!employeeProfile) {
            return res.status(404).send({
                message: `Employee with this id not found`,
                error: 'not found'
            });
        }

        res.status(200).send({
            message: 'Get employee profile success',
            data: employeeProfile,
            url: `${imageUrl}/${employeeProfile.photoPath}`
        });
    } catch (error) {
        res.status(500).send({
            message: 'Server failed to process this request',
            error: InternalErrorHandler(error)
        });
    }
};

export { getEmployee, createEmployeeDetail, editEmployeeDetail, deleteEmployee, getEmployeeProfile, uploadEmployeeImage };
