import nodemailer from 'nodemailer';
import otpModel from '../models/otp.model.js';
import visitorModel from '../models/visitor.model.js';
import userModel from '../models/user.model.js';
import visitStatusModel from '../models/visitStatus.model.js';

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASS
    }
});

const sendQREmailHandler = async (req, res) => {
    const id = req.params.id;
    const visitorData = await visitorModel.findByPk(id, {
        include: [
            {
                model: userModel,
                as: 'origin',
                attributes: ['companyName']
            },
            {
                model: userModel,
                as: 'destination',
                attributes: ['companyName']
            },
            {
                model: visitStatusModel,
                as: 'status',
                attributes: ['statusName']
            }
        ]
    });

    var mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: visitorData.email,
        subject: 'Visitor Registration',
        html: QREmailTemplate(visitorData)
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return {
                message: 'Failed sending QR email',
                error: error
            };
        } else {
            return {
                message: 'QR Email already sended',
                status: info.response
            };
        }
    });
};

const sendOTPEmailHandler = async (req, res) => {
    const existingOtp = await otpModel.findOne({
        where: {
            email: req.params.email
        }
    });

    var mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: existingOtp.email,
        subject: 'Visitor OTP Verification',
        html: OTPEmailTemplate(existingOtp.otpCode)
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            res.status(500).send({
                message: 'Failed sending OTP email',
                error: error
            });
            console.log(error);
        } else {
            res.status(200).send({
                message: 'OTP Email already sended',
                status: info.response,
                expiredAt: existingOtp.expiredAt
            });
        }
    });
};

const OTPEmailTemplate = (otpCode) => {
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
                                          <td align="center" style="padding: 20px 0;">
                                              <img style="width : 120px;" src="https://storage.googleapis.com/asa-file-storage/minang-techno/MT_black.png" alt="Company Logo" style="max-width: 200px;">
                                          </td>
                                      </tr>
                                      <tr>
                                          <td align="center" style="color: #333333; font-size: 28px; padding: 20px 0;">
                                              <strong>OTP Verification</strong>
                                          </td>
                                      </tr>
                                      <tr>
                                          <td align="center" style="color: #007BFF; font-size: 22px; padding: 0 30px;">
                                              <strong>AI Security Application for Visitor</strong>
                                          </td>
                                      </tr>
                                      <tr>
                                          <td align="center" style="color: #666666; font-size: 16px; padding: 20px 30px;">
                                              Please use the following One-Time Password (OTP) to verify your email address.
                                          </td>
                                      </tr>
                                      <tr>
                                          <td align="center" style="color: #333333; font-size: 36px; padding: 20px 0;">
                                              <strong>${otpCode}</strong>
                                          </td>
                                      </tr>
                                      <tr>
                                          <td align="center" style="color: #666666; font-size: 16px; padding: 0 30px;">
                                              This OTP is valid for 3 minutes. Do not share it with anyone.
                                          </td>
                                      </tr>
                                      <tr>
                                          <td align="center" style="padding: 40px 0;">
                                              <a href="https://ai-security-app-xqsfr2c4aq-et.a.run.app/visit-company/otp?otp=${otpCode}" style="background-color: #007BFF; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Your Email</a>
                                          </td>
                                      </tr>
                                  </table>
                              </td>
                          </tr>
                      </table>
                  </body>
                </html>`;
    return html;
};

const QREmailTemplate = (visitorData) => {
    const html = `<!DOCTYPE html>
                <html>
                  <head>
                      <meta charset="UTF-8">
                      <title>Congratulations on Your Registration!</title>
                      <style>
                          body {
                              font-family: Arial, sans-serif;
                              margin: 0;
                              padding: 0;
                              background-color: #f3f3f3;
                          }
                          .content {
                              max-width: 600px;
                              margin: 0 auto;
                              padding: 20px;
                              background-color: #ffffff;
                              border-radius: 8px;
                              box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
                              text-align: center;
                          }
                          .message {
                              color: #007BFF;
                              font-size: 24px;
                              margin-bottom: 20px;
                          }
                          .user-card {
                              background-color: #f9f9f9;
                              padding: 20px;
                              border-radius: 8px;
                              margin-bottom: 20px;
                              box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
                          }
                          .user-card p {
                              margin: 5px 0;
                          }
                          .user-image img {
                              height: auto;
                              border-radius: 5px;
                              width: 100px;
                              display: block;
                              margin: 0 auto;
                          }
                          .qr-image img {
                              height: auto;
                              border-radius: 5px;
                              width: 200px;
                              display: block;
                              margin: 0 auto;
                          }
                          .company-logo img {
                              width: 120px;
                          }
                      </style>
                  </head>
                  <body>
                      <div class="content">
                          <div class="company-logo">
                              <img src="https://storage.googleapis.com/asa-file-storage/minang-techno/MT_black.png" alt="Company Logo">
                          </div>
                          <div class="message">Congratulations on Your Registration</div>
                                      <div class="user-image">
                                  <img src="https://storage.googleapis.com/asa-file-storage/${visitorData.photoPath}" alt="QR Image">
                              </div>
                          <div class="user-card">
                              <p>Hello, <strong>${visitorData.name}</strong></p>
                              <p>You have successfully registered as a visitor.</p>
                              <p>Your Visitation ID: <strong>${visitorData.id}</strong></p>
                              <p>Your Origin: <strong>${visitorData.origin.companyName}</strong></p>
                              <p>Your destination: <strong>${visitorData.destination.companyName}</strong></p>
                              <div class="qr-image">
                                  <img src="https://storage.googleapis.com/asa-file-storage/${visitorData.qrPath}" alt="User Image">
                              </div>
                              <a href="https://ai-security-app-xqsfr2c4aq-et.a.run.app/visitor/track?id=${visitorData.id}" style="background-color: #007BFF; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Track Your Visitation</a>

                          </div>
                          <p style="color: #666666; font-size: 16px; margin-top: 20px;">
                          <strong>NOTE:</strong> Please keep your QR code private to safeguard your personal information and ensure your privacy.</p>

                      </div>
                  </body>
              </html>`;

    return html;
};

export { sendOTPEmailHandler, sendQREmailHandler, OTPEmailTemplate, QREmailTemplate };
