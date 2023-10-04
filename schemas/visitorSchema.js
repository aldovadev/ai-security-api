import Joi from "joi";

// Define a Joi schema that matches your Sequelize model
const visitorSchema = Joi.object({
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

export default visitorSchema;
