import Joi from 'joi';

const userSchema = Joi.object({
    companyName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    phoneNumber: Joi.string().required(),
    address: Joi.string().required(),
    serviceId: Joi.number().integer().required(),
    status: Joi.string().required(),
    userRole: Joi.string().required()
});

export { userSchema };
