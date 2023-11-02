import { Op } from 'sequelize';
import axios from 'axios';
import visitorModel from '../models/visitor.model.js';
import userModel from '../models/user.model.js';
import employeeModel from '../models/employee.model.js';
import visitStatusModel from '../models/visitStatus.model.js';
import { trainImageVisitor } from '../utils/trainerHandler.js';
import { recognizeTargetPath } from '../utils/uploadHandler.js';
import InternalErrorHandler from '../utils/errorHandler.js';
import fs from 'fs';
import FormData from 'form-data';

const setupMLToday = async (req, res) => {
    const mlUrl = process.env.ML_URL;
    try {
        const userId = req.id;
        await axios.delete(`${mlUrl}/visitor/reset?company_id=${userId}`);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const visitorData = await visitorModel.findAll({
            where: {
                destinationId: userId,
                statusId: 1002,
                startDate: {
                    [Op.between]: [today, tomorrow]
                }
            }
        });

        if (!visitorData)
            return res.status(500).send({
                message: 'No data to train for today',
                status: 'internal server error'
            });

        const responseTrain = await trainImageVisitor(visitorData);

        res.status(200).send({
            message: 'Success updating trained data for today',
            status: 'success',
            data: responseTrain
        });
    } catch (error) {
        res.status(500).send({
            message: 'Failed updating trained data for today',
            status: 'internal server error'
        });
    }
};

const recognizeImage = async (req, res) => {
    try {
        const imageUrl = process.env.IMAGE_URL;
        const mlUrl = process.env.ML_URL;
        const companyId = req.id;
        const location = `${recognizeTargetPath}/${companyId}/incoming_photo.png`;

        const formData = new FormData();
        formData.append('file', fs.createReadStream(location));
        const result = await axios.post(`${mlUrl}/recognize?company_id=${companyId}`, formData, {
            headers: {
                ...formData.getHeaders(),
                accept: 'application/json'
            }
        });

        let detectedData = {};
        let url = '';

        switch (result.data.type) {
            case 'visitor':
                detectedData = await visitorModel.findOne({
                    where: { visitNumber: result.data.id },
                    include: [
                        {
                            model: userModel,
                            as: 'origin',
                            attributes: ['companyName']
                        },
                        {
                            model: userModel,
                            as: 'destination',
                            attributes: ['companyName']
                        },
                        {
                            model: visitStatusModel,
                            as: 'status',
                            attributes: ['statusName']
                        }
                    ]
                });
                url = detectedData ? `${imageUrl}/${detectedData.photoPath}` : '';
                break;
            case 'employee':
                detectedData = await employeeModel.findOne({
                    where: { employeeId: result.data.id },
                    include: [
                        {
                            model: userModel,
                            as: 'company',
                            attributes: ['companyName']
                        }
                    ]
                });
                url = detectedData ? `${imageUrl}/${detectedData.photoPath}` : '';
                break;
            default:
                return res.status(404).send({
                    message: `Unrecognizable face`,
                    error: 'not found'
                });
        }

        return res.status(200).send({
            message: `recognize success`,
            status: 'success',
            type: result.data.type,
            data: detectedData,
            url: url
        });
    } catch (error) {
        res.status(500).send({
            message: 'Server failed to process this request',
            error: InternalErrorHandler(error)
        });
    }
};

const recognizeQR = async (req, res) => {
    const visitorId = req.params.id;
    const imageUrl = process.env.IMAGE_URL;

    try {
        const visitorProfile = await visitorModel.findByPk(visitorId, {
            include: [
                {
                    model: userModel,
                    as: 'origin',
                    attributes: ['companyName']
                },
                {
                    model: userModel,
                    as: 'destination',
                    attributes: ['companyName']
                },
                {
                    model: visitStatusModel,
                    as: 'status',
                    attributes: ['statusName']
                }
            ]
        });

        if (!visitorProfile) {
            return res.status(404).send({
                message: `Visitor with this id not found`,
                error: 'not found'
            });
        }

        res.status(200).send({
            message: 'Get visitor profile success',
            status: 'success',
            type: 'visitor',
            data: visitorProfile,
            url: `${imageUrl}/${visitorProfile.photoPath}`
        });
    } catch (error) {
        res.status(500).send({
            message: 'Server failed to process this request',
            error: InternalErrorHandler(error)
        });
    }
};

export { setupMLToday, recognizeImage, recognizeQR };
