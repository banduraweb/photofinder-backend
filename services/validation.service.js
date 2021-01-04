const Joi = require("joi");

class Validation {
  static registrationValidation(body) {
    const schema = Joi.object({
      name: Joi.string().min(3).required(),
      email: Joi.string().min(3).required().email(),
      password: Joi.string().min(3).required(),
    });
    return schema.validate(body);
  }

  static loginValidation(body) {
    const schema = Joi.object({
      email: Joi.string().min(3).required().email(),
      password: Joi.string().min(3).required(),
    });
    return schema.validate(body);
  }
  static resetPasswordValidation(body) {
    const schema = Joi.object({
      email: Joi.string().min(3).required().email(),
      password: Joi.string().min(3).required(),
      oldpassword: Joi.string().min(3).required(),
    });
    return schema.validate(body);
  }
  static photoValidation(body) {
    const schema = Joi.object({
      userId: Joi.string().required(),
      photoId: Joi.string().required(),
      url: Joi.string().required(),
    });
    return schema.validate(body);
  }

  static keyWordValidation(body) {
    const schema = Joi.object({
      userId: Joi.string().required(),
      keyword: Joi.string().required(),
    });
    return schema.validate(body);
  }
  static recoveryPasswordValidation(body) {
    const schema = Joi.object({
      newPassword: Joi.string().min(3).required(),
      confirmedNewPassword: Joi.string().min(3).required(),
    });
    return schema.validate(body);
  }
}

module.exports = Validation;
