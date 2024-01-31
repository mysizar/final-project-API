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
      subject = "Willkommen im floh.store. Bitte E-Mail bestätigen";
      link = "https://api.floh.store/user/confirm/register/" + token;
      html = readFileSync("templates/register/index.html", "utf-8");
      html = html.replace(/link_to_replace/g, link);
      text = readFileSync("templates/register/text.txt", "utf-8");
      text = text.replace(/link_to_replace/g, link);
      break;

    case "recover-password":
      subject = "Passwort vergessen?";
      link = "https://floh.store/profile/recover-password/" + token;
      html = readFileSync("templates/recoverPass/index.html", "utf-8");
      html = html.replace(/link_to_replace/g, link);
      text = readFileSync("templates/recoverPass/text.txt", "utf-8");
      text = text.replace(/link_to_replace/g, link);
      break;

    case "change-email":
      subject = "Bitte neue E-Mail-Adresse bestätigen";
      link = "https://api.floh.store/user/confirm/new-email/" + token;
      html = readFileSync("templates/changeEmail/index.html", "utf-8");
      html = html.replace(/link_to_replace/g, link);
      text = readFileSync("templates/changeEmail/text.txt", "utf-8");
      text = text.replace(/link_to_replace/g, link);
      break;

    case "password-changed":
      subject = "Passwort erfolgreich geändert";
      html = readFileSync("templates/changedPass/index.html", "utf-8");
      text = readFileSync("templates/changedPass/text.txt", "utf-8");
      break;

    case "message":
      subject = "Neue private Nachricht auf floh.store";
      link = "https://floh.store/products/" + token.pid;
      html = readFileSync("templates/newMessage/index.html", "utf-8");
      const el = `<a href="${link}" target="_blank" rel="noopener noreferrer">${token.title}</a>`;
      html = html.replace(/element_to_replace/g, el);
      text = readFileSync("templates/newMessage/text.txt", "utf-8");
      break;

    case "test":
      subject = "Test email";
      html = { path: token };
      break;

    default:
      console.log("sendEmail error --> wrong 'type' of message");
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
