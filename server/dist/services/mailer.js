"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransporter = getTransporter;
exports.sendEmail = sendEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const smtpHost = process.env.SMTP_HOST || "";
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER || "";
const smtpPass = process.env.SMTP_PASS || "";
const smtpFrom = process.env.SMTP_FROM || process.env.SMTP_USER || "";
let transporter = null;
function getTransporter() {
    if (!transporter) {
        if (!smtpHost || !smtpUser || !smtpPass) {
            throw new Error("SMTP env vars missing: SMTP_HOST/SMTP_USER/SMTP_PASS");
        }
        transporter = nodemailer_1.default.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: { user: smtpUser, pass: smtpPass },
        });
    }
    return transporter;
}
async function sendEmail(to, subject, html) {
    const t = getTransporter();
    await t.sendMail({ from: smtpFrom, to, subject, html });
}
//# sourceMappingURL=mailer.js.map