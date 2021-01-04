require("dotenv").config();
const errorTypes = require("../constants/errors");
const SystemErrorService = require("./errors.service");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
class EmailService {
  static async sendEmail(email) {
    try {
      const data = await sgMail
        .send(email)
        .then(() => {
          return { message: "Go to your mail and follow the instructions" };
        })
        .catch((error) => {
          return { error };
        });
      return data;
    } catch (error) {
      return SystemErrorService.error("An Internal error", errorTypes.Internal);
    }
  }
}

module.exports = EmailService;
