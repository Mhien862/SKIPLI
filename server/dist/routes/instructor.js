"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const firebase_1 = require("../services/firebase");
const validators_1 = require("../utils/validators");
const auth_1 = require("../middleware/auth");
const mailer_1 = require("../services/mailer");
const router = (0, express_1.Router)();
// All routes here require instructor role
router.use(auth_1.verifyToken, (0, auth_1.requireRole)("instructor"));
// POST /addStudent { name, phone, email }
router.post("/addStudent", async (req, res) => {
    try {
        const { name, phone, email } = req.body;
        (0, validators_1.assertString)(name, "name");
        (0, validators_1.assertString)(phone, "phone");
        (0, validators_1.assertPhone)(phone, "phone");
        (0, validators_1.assertString)(email, "email");
        (0, validators_1.assertEmail)(email);
        // Create or update student user
        const usersRef = firebase_1.db.collection("users");
        const existingByPhone = await usersRef.where("phone", "==", phone).limit(1).get();
        const now = Date.now();
        const ref = existingByPhone.docs[0]?.ref ?? usersRef.doc();
        const student = {
            phone,
            email,
            name,
            role: "student",
            createdAt: now,
            updatedAt: now,
        };
        await ref.set(student, { merge: true });
        // Send setup email with verification link
        const appUrl = process.env.APP_URL || "http://localhost:5173";
        const setupToken = Math.random().toString(36).slice(2);
        await ref.update({ setupToken });
        await (0, mailer_1.sendEmail)(email, "Welcome to Classroom App", `<p>Hello ${name},</p><p>Please set up your account by visiting the link below:</p><p><a href="${appUrl}/setup?email=${encodeURIComponent(email)}&token=${setupToken}">Complete Account Setup</a></p>`);
        res.json({ success: true });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// POST /assignLesson { studentPhone, title, description }
router.post("/assignLesson", async (req, res) => {
    try {
        const { studentPhone, title, description } = req.body;
        (0, validators_1.assertString)(studentPhone, "studentPhone");
        (0, validators_1.assertPhone)(studentPhone, "studentPhone");
        (0, validators_1.assertString)(title, "title");
        (0, validators_1.assertString)(description, "description");
        const usersRef = firebase_1.db.collection("users");
        const snap = await usersRef.where("phone", "==", studentPhone).limit(1).get();
        const studentDoc = snap.docs[0];
        if (!studentDoc)
            return res.status(404).json({ error: "Student not found" });
        const studentRef = studentDoc.ref;
        const lessonRef = studentRef.collection("lessons").doc();
        const now = Date.now();
        await lessonRef.set({
            id: lessonRef.id,
            title,
            description,
            status: "assigned",
            assignedAt: now,
        });
        res.json({ success: true, lessonId: lessonRef.id });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// GET /students
router.get("/students", async (_req, res) => {
    try {
        const snap = await firebase_1.db.collection("users").where("role", "==", "student").get();
        const students = snap.docs.map((d) => d.data());
        res.json({ students });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// GET /student/:phone
router.get("/student/:phone", async (req, res) => {
    try {
        const { phone } = req.params;
        (0, validators_1.assertString)(phone, "phone");
        const snap = await firebase_1.db.collection("users").where("phone", "==", phone).limit(1).get();
        const doc0 = snap.docs[0];
        if (!doc0)
            return res.status(404).json({ error: "Not found" });
        const lessonsSnap = await doc0.ref.collection("lessons").get();
        res.json({ profile: doc0.data(), lessons: lessonsSnap.docs.map((d) => d.data()) });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// PUT /editStudent/:phone
router.put("/editStudent/:phone", async (req, res) => {
    try {
        const { phone } = req.params;
        const { name, email } = req.body;
        (0, validators_1.assertString)(phone, "phone");
        if (email)
            (0, validators_1.assertEmail)(email);
        const snap = await firebase_1.db.collection("users").where("phone", "==", phone).limit(1).get();
        const doc0 = snap.docs[0];
        if (!doc0)
            return res.status(404).json({ error: "Not found" });
        const ref = doc0.ref;
        await ref.update({ ...(name ? { name } : {}), ...(email ? { email } : {}), updatedAt: Date.now() });
        res.json({ success: true });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// DELETE /student/:phone
router.delete("/student/:phone", async (req, res) => {
    try {
        const { phone } = req.params;
        (0, validators_1.assertString)(phone, "phone");
        const snap = await firebase_1.db.collection("users").where("phone", "==", phone).limit(1).get();
        const doc0 = snap.docs[0];
        if (!doc0)
            return res.status(404).json({ error: "Not found" });
        await doc0.ref.delete();
        res.json({ success: true });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=instructor.js.map