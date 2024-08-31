import asyncHandler from "express-async-handler";
import Brevo from "@getbrevo/brevo";
import sendinblue from "../utils/sendEmail";

// @desc Send mail
// @route POST /api/email
// @access Public
const sendEmail = asyncHandler(async (req, res) => {
  const { email } = req.body; //We will use this later
  console.log("email", email);
  let sendSmtpEmail = {
    to: [
      {
        email: email,
      },
    ],
    templateId: 2,
  };
  sendinblue(sendSmtpEmail);
  res.send("success");
});

export { sendEmail };
