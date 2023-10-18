import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmailHandler = (req, res, mailOptions, expired_at) => {
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      res.status(500).send({
        message: "Failed sending OTP email",
        error: error,
      });
      console.log(error);
    } else {
      res.status(200).send({
        message: "OTP Email already sended",
        status: info.response,
        expired_at: expired_at,
      });
    }
  });
};

function OTPEmailTemplate(otp_code) {
  const html = `<!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>OTP Verification</title>
                </head>
                <body style="font-family: Arial, sans-serif; background-color: #f3f3f3; margin: 0; padding: 0;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f3f3f3;">
                        <tr>
                            <td>
                                <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; margin-top: 30px; border-radius: 8px; box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);">
                                    <tr>
                                        <td align="center" style="color: #333333; font-size: 24px; padding: 20px 0;">
                                            <strong>OTP Verification</strong>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="center" style="color: #333333; font-size: 20px; padding: 20px 0;">
                                            <strong>AI Security Application for Visitor</strong>
                                        </td>
                                    </tr>
                                    <tr>
                                      <td align="center" style="color: #666666; font-size: 16px; padding: 0 30px;">
                                          Please use the following One-Time Password (OTP) to verify your email address.
                                      </td>
                                    </tr>
                                    <tr>
                                        <td align="center" style="color: #333333; font-size: 32px; padding: 20px 0;">
                                            <strong>${otp_code}</strong>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="center" style="color: #666666; font-size: 16px; padding: 0 30px;">
                                            This OTP is valid for 3 minutes. Do not share it with anyone.
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="center" style="padding: 40px 0 50px 0;">
                                            <a href="https://ai-security-app-xqsfr2c4aq-et.a.run.app/visit-company/otp?otp=${otp_code}" style="background-color: #007BFF; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Your Email</a>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>`;
  return html;
}

export { sendEmailHandler, OTPEmailTemplate };
