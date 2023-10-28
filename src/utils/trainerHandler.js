import fs from 'fs';
import mkdirp from 'mkdirp';
import axios from 'axios';
import path from 'path';
import FormData from 'form-data';

import { visitorTargetPath, employeeTargetPath } from '../utils/uploadHandler.js';
import bucket from '../utils/storageHandler.js';

const trainImageVisitor = async (visitorData) => {
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
    return results;
};

const trainImageEmployee = async (employeeData) => {
    const mlUrl = process.env.ML_URL;
    if (!fs.existsSync(`${employeeTargetPath}/${employeeData.companyId}`)) await mkdirp(`${employeeTargetPath}/${employeeData.companyId}`);
    const location = `${employeeTargetPath}/${employeeData.companyId}/${employeeData.employeeId}.png`;

    try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(location));
        const r = await axios.post(`${mlUrl}/employee/add?company_id=${employeeData.companyId}&employee_id=${employeeData.employeeId}`, formData, {
            headers: {
                ...formData.getHeaders(),
                accept: 'application/json'
            }
        });

        return r;
    } catch (error) {
        return error;
    }
};

export { trainImageVisitor, trainImageEmployee };
