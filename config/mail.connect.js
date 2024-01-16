import nodemailer from "nodemailer";
import { readFileSync } from "fs";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_SERVER2,
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER2,
    pass: process.env.SMTP_PASSWORD2,
  },
});

export async function sendEmail(type, userEmail, token) {
  let subject, link, html, text;
  switch (type) {
    case "registration":
      subject = "Willkommen im FLOH.STORE. Bitte Email bestätigen";
      link = "https://api.floh.store/user/confirm/email/" + token;
      html = readFileSync("templates/emails/confirm.html", "utf-8");
      html = html.replace(/link_to_replace/g, link);
      text = readFileSync("templates/emails/confirm.txt", "utf-8");
      text = text.replace(/link_to_replace/g, link);
      break;

    case "change-email":
      subject = "Bitte bestätige deine neue E-Mail-Adresse";
      link = "https://api.floh.store/user/confirm/new-email/" + token;
      // html = readFileSync("templates/emails/confirm.html", "utf-8");
      // html = html.replace(/link_to_replace/g, link);
      text = readFileSync("templates/emails/new-email.txt", "utf-8");
      text = text.replace(/link_to_replace/g, link);
      break;

    default:
      console.log("sendEmail error --> wrong message 'type'");
      break;
  }

  try {
    const info = await transporter.sendMail({
      from: '"floh.store" <no-reply@floh.store>',
      to: userEmail, // list (string or array) of receivers
      subject: subject,
      text: text,
      html: html, // html body
    });

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.log(error);
  }
}
