"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTwilioClient = getTwilioClient;
exports.sendSms = sendSms;
const twilio_1 = __importDefault(require("twilio"));
const accountSid = process.env.TWILIO_ACCOUNT_SID || "";
const authToken = process.env.TWILIO_AUTH_TOKEN || "";
const fromNumber = process.env.TWILIO_FROM_NUMBER || "";
let client = null;
function getTwilioClient() {
    if (!client) {
        if (!accountSid || !authToken) {
            throw new Error("Twilio credentials missing: TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN");
        }
        client = (0, twilio_1.default)(accountSid, authToken);
    }
    return client;
}
async function sendSms(to, body) {
    if (!fromNumber) {
        throw new Error("TWILIO_FROM_NUMBER is not set");
    }
    const cli = getTwilioClient();
    await cli.messages.create({ to, from: fromNumber, body });
}
//# sourceMappingURL=twilio.js.map