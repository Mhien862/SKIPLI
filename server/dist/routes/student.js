"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const firebase_1 = require("../services/firebase");
const validators_1 = require("../utils/validators");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes here require student role
router.use(auth_1.verifyToken, (0, auth_1.requireRole)("student"));
// GET /myLessons?phone=xxx
router.get("/myLessons", async (req, res) => {
    try {
        const { phone } = req.query;
        if (!phone)
            return res.status(400).json({ error: "phone is required" });
        const snap = await firebase_1.db.collection("users").where("phone", "==", phone).limit(1).get();
        const doc0 = snap.docs[0];
        if (!doc0)
            return res.status(404).json({ error: "Not found" });
        const lessonsSnap = await doc0.ref.collection("lessons").get();
        res.json({ lessons: lessonsSnap.docs.map((d) => d.data()) });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// POST /markLessonDone { phone, lessonId }
router.post("/markLessonDone", async (req, res) => {
    try {
        const { phone, lessonId } = req.body;
        (0, validators_1.assertString)(phone, "phone");
        (0, validators_1.assertString)(lessonId, "lessonId");
        const snap = await firebase_1.db.collection("users").where("phone", "==", phone).limit(1).get();
        const doc0 = snap.docs[0];
        if (!doc0)
            return res.status(404).json({ error: "Not found" });
        const lessonRef = doc0.ref.collection("lessons").doc(lessonId);
        await lessonRef.set({ status: "done", completedAt: Date.now() }, { merge: true });
        res.json({ success: true });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
// PUT /editProfile { phone, name, email }
router.put("/editProfile", async (req, res) => {
    try {
        const { phone, name, email } = req.body;
        (0, validators_1.assertString)(phone, "phone");
        if (email)
            (0, validators_1.assertEmail)(email);
        const snap = await firebase_1.db.collection("users").where("phone", "==", phone).limit(1).get();
        const doc0 = snap.docs[0];
        if (!doc0)
            return res.status(404).json({ error: "Not found" });
        await doc0.ref.update({ ...(name ? { name } : {}), ...(email ? { email } : {}), updatedAt: Date.now() });
        res.json({ success: true });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=student.js.map