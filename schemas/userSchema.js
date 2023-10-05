import Joi from "joi";

const userSchema = Joi.object({
  company_name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  phone_number: Joi.string().required(),
  address: Joi.string().required(),
  service_id: Joi.number().integer().required(),
  status: Joi.string().required(),
  user_role: Joi.string().required(),
});

export default userSchema;
