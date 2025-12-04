/**
 * @file emailService.js
 * @description Sends emails using AWS SES. Includes debug logging.
 */

const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const ses = new SESClient({ region: process.env.AWS_REGION });

async function sendEmail({ to, subject, html }) {
  if (!process.env.SES_SOURCE_EMAIL) {
    throw new Error("SES_SOURCE_EMAIL is not defined in environment variables");
  }

  const params = {
    Destination: { ToAddresses: [to] },
    Message: {
      Body: {
        Html: { Data: html },
      },
      Subject: { Data: subject },
    },
    Source: process.env.SES_SOURCE_EMAIL, // must be a verified email in SES
  };

  try {
    const command = new SendEmailCommand(params);
    const result = await ses.send(command);

    console.log(`[DEBUG] SES send success → MessageId: ${result.MessageId}, To: ${to}`);
    return result;
  } catch (err) {
    console.error(`[ERROR] SES send failed → To: ${to}`, err);
    throw err; // rethrow so route handler can also catch
  }
}

module.exports = sendEmail;
