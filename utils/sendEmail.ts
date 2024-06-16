import nodemailer from "nodemailer";
var SibApiV3Sdk = require("sib-api-v3-sdk");
var defaultClient = SibApiV3Sdk.ApiClient.instance;

// Configure API key authorization: api-key
var apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey =
  "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";
var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const sendinblue = (sendSmtpEmail: any) => {
  apiInstance.sendTransacEmail(sendSmtpEmail).then(
    function (data: any) {
      return true;
    },
    function (error: any) {
      console.error(error);
      return false;
    }
  );
};

export const sendEmail = async (subject: string, html_output: string) => {
  let transporter = nodemailer.createTransport({
    host: "ssl0.ovh.net",
    port: 465,
    secure: true,
    auth: {
      user: "info-vente@k-val.com",
      pass: "Hello13012!",
    },
  });

  let info = await transporter.sendMail({
    from: `contact@kvaloccaz.com`,
    to: "hadrien.jaubert99@gmail.com",
    bcc: "contact@kvaloccaz.com",
    subject: subject,
    html: html_output,
  });
  console.log("Message sent: %s", info);
};

export default sendinblue;
