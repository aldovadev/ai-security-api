import { Op } from 'sequelize';
import moment from 'moment';
import fs from 'fs';
import axios from 'axios';
import mkdirp from 'mkdirp';
import { v4 as uuid } from 'uuid';

import { createVisitorSchema, editStatusSchema } from '../schemas/visitor.schema.js';
import { visitorTargetPath } from '../utils/uploadHandler.js';
import InternalErrorHandler from '../utils/errorHandler.js';
import bucket from '../utils/storageHandler.js';

import visitorModel from '../models/visitor.model.js';
import userModel from '../models/user.model.js';
import visitStatusModel from '../models/visitStatus.model.js';
import trackingModel from '../models/tracking.model.js';
import db from '../config/database.js';
import { trainImageVisitor } from '../utils/trainerHandler.js';
import qr from 'qrcode';
import { sendQREmailHandler } from '../utils/emailHandler.js';

const createVisitorDetail = async (req, res) => {
    const { error } = createVisitorSchema.validate(req.body);

    if (error) return res.status(400).send({ message: error.details[0].message, error: 'bad request' });

    const visitorData = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    try {
        const todayData = await visitorModel.findOne({
            where: {
                email: visitorData.email,
                destinationId: visitorData.destinationId,
                createdAt: {
                    [Op.between]: [today, tomorrow]
                }
            }
        });

        if (todayData)
            return res.status(400).send({
                message: `You already make a visit request today`,
                error: 'bad request'
            });
        const newId = uuid();
        const userData = await userModel.findByPk(visitorData.destinationId);
        const now = new Date();
        const visitNumber = await generateVisitNumber(now);
        const photoPath = 'visitor/' + userData.id + '/' + moment(now).format('YY') + '/' + moment(now).format('MM') + '/' + moment(now).format('DD') + '/' + visitNumber;
        const qrPath = 'visitor/' + userData.id + '/' + moment(now).format('YY') + '/' + moment(now).format('MM') + '/' + moment(now).format('DD') + '/' + visitNumber + '/' + newId + '.png';

        const qrLocation = `${visitorTargetPath}/${visitorData.destinationId}/${newId}.png`;
        if (!fs.existsSync(`${visitorTargetPath}/${visitorData.destinationId}`)) {
            await mkdirp(`${visitorTargetPath}/${visitorData.destinationId}`);
        }
        await generateQRCode(newId, qrLocation);

        await bucket.upload(qrLocation, {
            destination: qrPath,
            metadata: {
                cacheControl: 'public, max-age=31536000'
            }
        });

        const newVisitor = await visitorModel.create({
            id: newId,
            name: visitorData.name,
            email: visitorData.email,
            phoneNumber: visitorData.phoneNumber,
            gender: visitorData.gender,
            address: visitorData.address,
            startDate: visitorData.startDate,
            endDate: visitorData.endDate,
            visitReason: visitorData.visitReason,
            visitNumber: visitNumber,
            originId: visitorData.originId,
            destinationId: visitorData.destinationId,
            statusId: 1006,
            photoPath: photoPath,
            qrPath: qrPath
        });

        await fs.unlinkSync(qrLocation);

        res.status(200).send({
            message: 'Visitor has been created',
            status: 'success',
            data: newVisitor
        });
    } catch (error) {
        res.status(500).send({
            message: 'Server failed to process this request',
            error: InternalErrorHandler(error)
        });
    }
};

const editVisitorDetail = async (req, res) => {
    const visitorId = req.params.id;
    const updateVisitorData = req.body;

    try {
        const visitorData = await visitorModel.findByPk(visitorId);

        if (!visitorData) {
            return res.status(404).send({
                message: `Visitor with this id not found`,
                error: 'not found'
            });
        }

        if (updateVisitorData.destinationId) {
            const newPhotoPath = await visitorData.photoPath.replace(/\/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}\//, `/${updateVisitorData.destinationId}/`);
            console.log(visitorData.photoPath);
            console.log(newPhotoPath);
            await bucket.file(visitorData.photoPath).move(newPhotoPath);
            updateVisitorData.photoPath = newPhotoPath;
        }

        await visitorData.update(updateVisitorData);

        res.status(200).send({
            message: `Visitor with this id has been updated`,
            status: 'success',
            data: visitorData
        });
    } catch (error) {
        res.status(500).send({
            message: 'Server failed to process this request',
            error: InternalErrorHandler(error)
        });
    }
};

const uploadVisitorImage = async (req, res) => {
    const imageUrl = process.env.IMAGE_URL;
    const visitorId = req.params.id;

    const t = await db.transaction();

    try {
        const visitorData = await visitorModel.findByPk(visitorId);

        const location = `${visitorTargetPath}/${visitorData.destinationId}/${visitorData.visitNumber}.png`;
        const destination = `${visitorData.photoPath}/${visitorData.visitNumber}.png`;

        visitorData.photoPath = destination;
        const lastStatus = visitorData.statusId;
        visitorData.statusId = 1001;
        await visitorData.save({ transaction: t });
        await trackingModel.create(
            {
                visitorId: visitorData.id,
                visitNumber: visitorData.visitNumber,
                statusFrom: lastStatus,
                statusTo: visitorData.statusId
            },
            {
                transaction: t
            }
        );

        await bucket.upload(location, {
            destination: destination,
            metadata: {
                cacheControl: 'public, max-age=31536000'
            }
        });
        await t.commit();
        await fs.unlinkSync(location);
        const QREmail = await sendQREmailHandler(req, res);

        return res.status(200).send({
            message: 'Success uploading visitor image, do not forget to check your email or contact us for more information.',
            status: 'done',
            url: `${imageUrl}/${destination}`
        });
    } catch (error) {
        if (t) await t.rollback();
        return res.status(500).send({
            message: 'Failed uploading visitor image',
            error: error
        });
    }
};

const changeVisitorImage = async (req, res) => {
    const imageUrl = process.env.IMAGE_URL;
    const visitorId = req.params.id;

    try {
        const visitorData = await visitorModel.findByPk(visitorId);
        const location = `${visitorTargetPath}/${visitorData.destinationId}/${visitorData.visitNumber}.png`;
        const destination = visitorData.photoPath;

        await bucket.upload(location, {
            destination: destination,
            metadata: {
                cacheControl: 'public, max-age=31536000'
            }
        });

        await fs.unlinkSync(location);

        return res.status(200).send({
            message: 'Success change visitor image',
            status: 'done',
            url: `${imageUrl}/${destination}`
        });
    } catch (error) {
        return res.status(500).send({
            message: 'Failed change visitor image',
            error: error
        });
    }
};

const getVisitor = async (req, res) => {
    const queryData = req.query;

    try {
        const statusData = await visitStatusModel.findOne({
            where: {
                statusName: {
                    [Op.iLike]: queryData.status
                }
            }
        });

        if (!statusData && queryData.status !== 'all') return res.status(404).send({ message: 'Status is not found', error: 'status invalid' });

        const userData = await userModel.findOne({
            where: {
                email: req.email
            }
        });

        if (!userData) return res.status(404).send({ message: 'Email is not found', error: 'email invalid' });

        let visitorData;

        if (queryData.status === 'all') {
            visitorData = await visitorModel.findAll({
                where: { destinationId: userData.id },
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
        } else {
            visitorData = await visitorModel.findAll({
                where: {
                    destinationId: userData.id,
                    statusId: statusData.statusId
                },
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
        }

        res.status(200).send({
            message: `Get visitor data success`,
            status: 'success',
            company: userData.companyName,
            data: visitorData
        });
    } catch (error) {
        res.status(500).send({
            message: 'Server failed to process this request',
            error: InternalErrorHandler(error)
        });
    }
};

const deleteVisitor = async (req, res) => {
    const visitorId = req.params.id;
    const mlUrl = process.env.ML_URL;

    const visitorData = await visitorModel.findByPk(visitorId);

    if (!visitorData) {
        return res.status(404).send({
            message: `Visitor with this id not found`,
            error: 'not found'
        });
    }

    const startDate = new Date(visitorData.startDate);
    const now = new Date();

    try {
        if (startDate.getDate() === now.getDate()) {
            await axios.delete(`${mlUrl}/visitor/delete?company_id=${visitorData.destinationId}&visit_number=${visitorData.visitNumber}`);
        }
        await bucket.file(visitorData.photoPath).delete();
        await bucket.file(visitorData.qrPath).delete();
        await visitorData.destroy();

        res.status(200).send({
            message: `Visitor with this id has been deleted`,
            status: 'success'
        });
    } catch (error) {
        res.status(500).send({
            message: 'Server failed to process this request',
            error: InternalErrorHandler(error)
        });
    }
};

const getVisitorProfile = async (req, res) => {
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

const changeVisitorStatus = async (req, res) => {
    const { error } = editStatusSchema.validate(req.body);

    if (error) return res.status(400).send({ message: error.details[0].message, error: 'bad request' });

    const updateStatusData = req.body;
    const mlUrl = process.env.ML_URL;

    const t = await db.transaction();

    try {
        const visitorData = await visitorModel.findByPk(updateStatusData.id);

        if (visitorData.statusId === updateStatusData.statusId) return res.status(400).send({ message: 'This visitor data already in this status', error: 'bad request' });

        let mlUpdateResult;

        if (updateStatusData.statusId === 1003 || updateStatusData.statusId === 1004) {
            mlUpdateResult = await axios.delete(`${mlUrl}/visitor/delete?company_id=${visitorData.destinationId}&visit_number=${visitorData.visitNumber}`);
        }

        const now = new Date();
        const startDate = new Date(visitorData.startDate);

        if (updateStatusData.statusId === 1002 && now.getDate() === startDate.getDate()) {
            mlUpdateResult = await trainImageVisitor([visitorData]);
        }

        const lastStatus = visitorData.statusId;
        visitorData.statusId = updateStatusData.statusId;

        await trackingModel.create(
            {
                visitorId: visitorData.id,
                visitNumber: visitorData.visitNumber,
                statusFrom: lastStatus,
                statusTo: visitorData.statusId
            },
            {
                transaction: t
            }
        );

        await visitorData.save({ transaction: t });

        await t.commit();

        res.status(200).send({
            message: `Visit status visitor with this id has been updated`,
            status: 'success',
            detail: mlUpdateResult?.data
        });
    } catch (error) {
        if (t) await t.rollback();
        res.status(500).send({
            message: 'Server failed to process this request',
            error: InternalErrorHandler(error)
        });
    }
};

const trackVisitor = async (req, res) => {
    const visitorId = req.params.id;
    const imageUrl = process.env.IMAGE_URL;

    try {
        const visitorData = await visitorModel.findByPk(visitorId, {
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
        const trackingData = await trackingModel.findAll({
            order: [['createdAt', 'DESC']],
            where: {
                visitorId: visitorId
            },
            attributes: {
                exclude: ['id', 'createdAt']
            },
            include: [
                {
                    model: visitStatusModel,
                    as: 'from',
                    attributes: ['statusName']
                },
                {
                    model: visitStatusModel,
                    as: 'to',
                    attributes: ['statusName']
                }
            ]
        });

        if (!visitorData) return res.status(404).send({ message: 'Visit id is not found', error: 'not found' });

        res.status(200).send({
            message: `Get tracking data success`,
            status: 'success',
            data: visitorData,
            url: `${imageUrl}/${visitorData.photoPath}`,
            tracking: trackingData
        });
    } catch (error) {
        res.status(500).send({
            message: 'Server failed to process this request',
            error: InternalErrorHandler(error)
        });
    }
};

export { getVisitor, createVisitorDetail, editVisitorDetail, deleteVisitor, getVisitorProfile, changeVisitorImage, uploadVisitorImage, changeVisitorStatus, trackVisitor };

const generateVisitNumber = async (now) => {
    const lastVisitor = await visitorModel.findOne({
        order: [['createdAt', 'DESC']]
    });

    let incrementedSeq = '00';

    if (lastVisitor !== null) {
        const lastAlphanumericSeq = lastVisitor.visitNumber.substr(-2);
        incrementedSeq = (parseInt(lastAlphanumericSeq, 36) + 1).toString(36).toUpperCase();

        const firstSixDigits = lastVisitor.visitNumber.substring(0, 8);

        if (incrementedSeq > 'ZZ' || firstSixDigits !== moment(now).format('YYYYMMDD')) incrementedSeq = '00';
    }

    incrementedSeq = incrementedSeq.padStart(2, '0');
    const result = moment(now).format('YYYYMMDD') + 'VST' + incrementedSeq;

    return result;
};

const generateQRCode = async (data, filePath) => {
    qr.toFile(filePath, data, (err) => {
        if (err) {
            console.error(err);
            return;
        }
    });
};
