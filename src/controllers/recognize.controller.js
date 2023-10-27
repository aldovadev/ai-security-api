import { Op } from 'sequelize';
import fs from 'fs';
import mkdirp from 'mkdirp';
import axios from 'axios';
import path from 'path';
import FormData from 'form-data';

import { visitorTargetPath } from '../utils/uploadHandler.js';
import bucket from '../utils/storageHandler.js';

import visitorModel from '../models/visitor.model.js';
import userModel from '../models/user.model.js';

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

        const responseTrain = await trainImageToPythonServer(visitorData);

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

export { setupMLToday };

const trainImageToPythonServer = async (visitorData) => {
    const totalTrain = [];
    const mlUrl = process.env.ML_URL;

    const promises = visitorData.map(async (data) => {
        const filename = path.basename(data.photoPath);
        if (!fs.existsSync(`${visitorTargetPath}/${data.destinationId}`)) await mkdirp(`${visitorTargetPath}/${data.destinationId}`);

        const destinationPath = `${visitorTargetPath}/${data.destinationId}/${filename}`;

        return new Promise((resolve, reject) => {
            bucket
                .file(data.photoPath)
                .createReadStream()
                .pipe(fs.createWriteStream(destinationPath))
                .on('finish', async () => {
                    const formData = new FormData();
                    formData.append('file', fs.createReadStream(destinationPath));

                    try {
                        const r = await axios.post(`${mlUrl}/visitor/add?company_id=${data.destinationId}&visit_number=${data.visitNumber}`, formData, {
                            headers: {
                                ...formData.getHeaders(),
                                accept: 'application/json'
                            }
                        });

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

    console.log(results);
    return results;
};
