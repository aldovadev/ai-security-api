import { Op } from 'sequelize';
import axios from 'axios';
import visitorModel from '../models/visitor.model.js';
import userModel from '../models/user.model.js';
import { trainImageVisitor } from '../utils/trainerHandler.js';

const setupMLToday = async (req, res) => {
    const mlUrl = process.env.ML_URL;
    try {
        const userData = await userModel.findOne({
            where: {
                email: req.email
            }
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
    res.send({ message: 'Recognize is working!' });
};

export { setupMLToday, recognizeImage };
