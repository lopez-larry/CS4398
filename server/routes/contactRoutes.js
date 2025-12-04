/**
 * @file contactRoutes.js
 * @description Handles contact form submissions by sending emails via AWS SES.
 */

const express = require("express");
const { SendEmailCommand } = require("@aws-sdk/client-ses");
const sesClient = require("../config/ses");

const router = express.Router();

// POST /api/contact
router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !message) {
      return res.status(400).json({ success: false, message: "Name and message are required." });
    }

    // Construct SES email
    const params = {
      Source: "no-reply@larry-lopez.com", // Verified SES identity
      Destination: {
        ToAddresses: ["your.personal.email@gmail.com"], // Where you want to receive contact emails
      },
      Message: {
        Subject: { Data: `New Contact Submission from ${name}` },
        Body: {
          Text: {
            Data: `Name: ${name}\nEmail: ${email || "N/A"}\n\nMessage:\n${message}`,
          },
        },
      },
    };

    await sesClient.send(new SendEmailCommand(params));

    return res.status(200).json({
      success: true,
      message: "Message sent! Please allow 2-3 business days for a response.",
    });
  } catch (err) {
    console.error("[SES ERROR]", err);
    return res.status(500).json({ success: false, message: "Failed to send message." });
  }
});

module.exports = router;
