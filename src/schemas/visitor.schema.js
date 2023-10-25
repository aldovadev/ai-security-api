import Joi from 'joi';

const createVisitorSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phoneNumber: Joi.string().required(),
    gender: Joi.string().required(),
    address: Joi.string().required(),
    originId: Joi.string().allow(null),
    destinationId: Joi.string().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    visitReason: Joi.string().required()
});

const editStatusSchema = Joi.object({
    id: Joi.string().required(),
    statusId: Joi.number().required()
});

export { createVisitorSchema, editStatusSchema };
