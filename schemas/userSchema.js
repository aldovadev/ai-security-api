import Joi from "joi";

const userSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  phone_number: Joi.string().required(),
  address: Joi.string().required(),
  service_id: Joi.number().integer().required(),
  status: Joi.string().required(),
  role_id: Joi.number().integer().required(),
});

export default userSchema;
