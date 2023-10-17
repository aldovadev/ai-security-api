import Joi from "joi";

const createVisitorSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone_number: Joi.string().required(),
  gender: Joi.string().required(),
  address: Joi.string().required(),
  company_origin: Joi.string().allow(null),
  company_destination: Joi.string().required(),
  start_date: Joi.date().required(),
  end_date: Joi.date().required(),
  visit_reason: Joi.string().required(),
});

const editStatusSchema = Joi.object({
  id: Joi.number().required(),
  visit_status: Joi.string().required(),
});

export { createVisitorSchema, editStatusSchema };
