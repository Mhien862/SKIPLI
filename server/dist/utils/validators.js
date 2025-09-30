"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertString = assertString;
exports.assertEmail = assertEmail;
exports.assertPhone = assertPhone;
exports.generateSixDigitCode = generateSixDigitCode;
function assertString(value, field) {
    if (typeof value !== "string" || value.trim() === "") {
        throw new Error(`${field} is required`);
    }
}
function assertEmail(value, field = "email") {
    const re = /\S+@\S+\.\S+/;
    if (!re.test(value)) {
        throw new Error(`${field} is invalid`);
    }
}
function assertPhone(value, field = "phoneNumber") {
    // Basic check; Twilio prefers E.164 format
    const cleaned = value.replace(/[^\d+]/g, "");
    if (cleaned.length < 8) {
        throw new Error(`${field} is invalid`);
    }
}
function generateSixDigitCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
//# sourceMappingURL=validators.js.map