"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const firebase_1 = require("../services/firebase");
const twilio_1 = require("../services/twilio");
const mailer_1 = require("../services/mailer");
const validators_1 = require("../utils/validators");
const auth_1 = require("../middleware/auth");
const bcrypt_1 = __importDefault(require("bcrypt"));
const router = (0, express_1.Router)();
// POST /createAccessCode { phoneNumber }
router.post("/createAccessCode", async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        (0, validators_1.assertString)(phoneNumber, "phoneNumber");
        (0, validators_1.assertPhone)(phoneNumber);
        const code = (0, validators_1.generateSixDigitCode)();
        const usersRef = firebase_1.db.collection("users");
        const snap = await usersRef
            .where("phone", "==", phoneNumber)
            .limit(1)
            .get();
        const userDoc = snap.docs[0]?.ref ?? usersRef.doc();
        const now = Date.now();
        const data = {
            phone: phoneNumber,
            updatedAt: now,
            accessCode: code,
        };
        await userDoc.set({
            name: "",
            role: "student",
            email: "",
            createdAt: now,
            ...data,
        }, { merge: true });
        await (0, twilio_1.sendSms)(phoneNumber, `Your access code is ${code}`);
        res.json({ success: true });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// POST /validateAccessCode { phoneNumber, accessCode }
router.post("/validateAccessCode", async (req, res) => {
    try {
        const { phoneNumber, accessCode } = req.body;
        (0, validators_1.assertString)(phoneNumber, "phoneNumber");
        (0, validators_1.assertPhone)(phoneNumber);
        (0, validators_1.assertString)(accessCode, "accessCode");
        const usersRef = firebase_1.db.collection("users");
        const snap = await usersRef
            .where("phone", "==", phoneNumber)
            .limit(1)
            .get();
        const doc0 = snap.docs[0];
        if (!doc0)
            return res.status(400).json({ error: "User not found" });
        const user = doc0.data();
        if (user.accessCode !== accessCode)
            return res.status(400).json({ error: "Invalid code" });
        await doc0.ref.update({ accessCode: "", updatedAt: Date.now() });
        const token = (0, auth_1.signToken)({ phone: user.phone, role: user.role });
        res.json({ success: true, role: user.role, token });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// Student Email Login
// POST /student/loginEmail { email }
router.post("/student/loginEmail", async (req, res) => {
    try {
        const { email } = req.body;
        (0, validators_1.assertString)(email, "email");
        (0, validators_1.assertEmail)(email);
        const code = (0, validators_1.generateSixDigitCode)();
        // Find user by email
        const usersRef = firebase_1.db.collection("users");
        const snap = await usersRef.where("email", "==", email).limit(1).get();
        const doc0 = snap.docs[0];
        if (!doc0)
            return res.status(400).json({ error: "Student not found" });
        const ref = doc0.ref;
        await ref.update({ emailAccessCode: code, updatedAt: Date.now() });
        const appUrl = process.env.APP_URL || "http://localhost:5173";
        await (0, mailer_1.sendEmail)(email, "Your Login Code", `<p>Your access code is <b>${code}</b>.</p><p>Or click to continue: <a href="${appUrl}/verify-email?email=${encodeURIComponent(email)}">Verify Email</a></p>`);
        res.json({ success: true });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// POST /student/validateAccessCode { email, accessCode }
router.post("/student/validateAccessCode", async (req, res) => {
    try {
        const { email, accessCode } = req.body;
        (0, validators_1.assertString)(email, "email");
        (0, validators_1.assertEmail)(email);
        (0, validators_1.assertString)(accessCode, "accessCode");
        const usersRef = firebase_1.db.collection("users");
        const snap = await usersRef.where("email", "==", email).limit(1).get();
        const doc0 = snap.docs[0];
        if (!doc0)
            return res.status(400).json({ error: "Student not found" });
        const data = doc0.data();
        if (data.emailAccessCode !== accessCode)
            return res.status(400).json({ error: "Invalid code" });
        await doc0.ref.update({ emailAccessCode: "", updatedAt: Date.now() });
        const token = (0, auth_1.signToken)({ phone: data.phone, role: data.role });
        res.json({ success: true, token });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// POST /student/setupAccount { email, token, username, password }
router.post("/student/setupAccount", async (req, res) => {
    try {
        const { email, token, username, password } = req.body;
        (0, validators_1.assertString)(email, "email");
        (0, validators_1.assertEmail)(email);
        (0, validators_1.assertString)(token, "token");
        (0, validators_1.assertString)(username, "username");
        (0, validators_1.assertString)(password, "password");
        const usersRef = firebase_1.db.collection("users");
        const snap = await usersRef.where("email", "==", email).limit(1).get();
        const doc0 = snap.docs[0];
        if (!doc0)
            return res.status(400).json({ error: "Student not found" });
        const ref = doc0.ref;
        const data = doc0.data();
        if (data.setupToken !== token)
            return res.status(400).json({ error: "Invalid token" });
        const passwordHash = await bcrypt_1.default.hash(password, 10);
        await ref.update({
            username,
            passwordHash,
            setupToken: "",
            updatedAt: Date.now(),
        });
        res.json({ success: true });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// POST /loginPassword { username, password }
router.post("/loginPassword", async (req, res) => {
    try {
        const { username, password } = req.body;
        (0, validators_1.assertString)(username, "username");
        (0, validators_1.assertString)(password, "password");
        const snap = await firebase_1.db
            .collection("users")
            .where("username", "==", username)
            .limit(1)
            .get();
        const doc0 = snap.docs[0];
        if (!doc0)
            return res.status(400).json({ error: "User not found" });
        const data = doc0.data();
        const ok = await bcrypt_1.default.compare(password, data.passwordHash || "");
        if (!ok)
            return res.status(400).json({ error: "Invalid credentials" });
        const token = (0, auth_1.signToken)({ phone: data.phone, role: data.role });
        res.json({ success: true, token, role: data.role });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map