import nodemailer from "nodemailer";

let transporter;

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getMailTransporter() {
  if (transporter) return transporter;

  const host = getRequiredEnv("MAILTRAP_HOST");
  const port = Number(getRequiredEnv("MAILTRAP_PORT"));
  const user = getRequiredEnv("MAILTRAP_USER");
  const pass = getRequiredEnv("MAILTRAP_PASS");

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
}
