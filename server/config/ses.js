// server/config/ses.js
const { SESClient } = require("@aws-sdk/client-ses");

const sesClient = new SESClient({
  region: "us-east-1", // Match your SES region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

module.exports = sesClient;
