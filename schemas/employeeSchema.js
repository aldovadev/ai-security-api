import Joi from "joi";

const employeeSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone_number: Joi.string().required(),
  gender: Joi.string().required(),
  employee_id: Joi.string().required(),
  position: Joi.string().required(),
  address: Joi.string().required(),
});

export default employeeSchema;
