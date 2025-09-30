import nodemailer from "nodemailer";
export declare function getTransporter(): nodemailer.Transporter;
export declare function sendEmail(to: string, subject: string, html: string): Promise<void>;
//# sourceMappingURL=mailer.d.ts.map