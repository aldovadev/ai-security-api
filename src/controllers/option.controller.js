import InternalErrorHandler from '../utils/errorHandler.js';
import serviceModel from '../models/service.model.js';
import visitStatusModel from '../models/visitStatus.model.js';
import roleModel from '../models/role.model.js';
import userModel from '../models/user.model.js';

const getCompany = async (req, res) => {
    try {
        const companyData = await userModel.findAll({
            attributes: ['id', 'companyName']
        });

        res.status(200).send({ message: 'success get company data', data: companyData });
    } catch (error) {
        res.status(500).send({
            message: 'Server failed to process this request',
            error: InternalErrorHandler(error)
        });
    }
};

const getService = async (req, res) => {
    try {
        const serviceData = await serviceModel.findAll();
        res.status(200).send({ message: 'success get service data', data: serviceData });
    } catch (error) {
        res.status(500).send({
            message: 'Server failed to process this request',
            error: InternalErrorHandler(error)
        });
    }
};

const getRole = async (req, res) => {
    try {
        const roleData = await roleModel.findAll();
        res.status(200).send({ message: 'success get role data', data: roleData });
    } catch (error) {
        res.status(500).send({
            message: 'Server failed to process this request',
            error: InternalErrorHandler(error)
        });
    }
};

const getVisitStatus = async (req, res) => {
    try {
        const visitStatusData = await visitStatusModel.findAll();
        res.status(200).send({
            message: 'success get visitor status data',
            data: visitStatusData
        });
    } catch (error) {
        res.status(500).send({
            message: 'Server failed to process this request',
            error: InternalErrorHandler(error)
        });
    }
};

export { getCompany, getService, getVisitStatus, getRole };
