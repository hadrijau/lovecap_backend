import nodemailer from "nodemailer";

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
