import Joi from 'joi';

const employeeSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phoneNumber: Joi.string().required(),
    gender: Joi.string().required(),
    employeeId: Joi.string().required(),
    position: Joi.string().required(),
    address: Joi.string().required()
});

export default employeeSchema;
