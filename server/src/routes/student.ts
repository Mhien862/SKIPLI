import { Router } from "express";
import { db } from "../services/firebase";
import { assertEmail, assertPhone, assertString } from "../utils/validators";
import { verifyToken, requireRole } from "../middleware/auth";

const router = Router();

// All routes here require student role
router.use(verifyToken, requireRole("student"));

// GET /myLessons?phone=xxx
router.get("/myLessons", async (req, res) => {
  try {
    const { phone } = req.query as { phone?: string };
    if (!phone) return res.status(400).json({ error: "phone is required" });
    const snap = await db
      .collection("users")
      .where("phone", "==", phone)
      .limit(1)
      .get();
    const doc0 = snap.docs[0];
    if (!doc0) return res.status(404).json({ error: "Not found" });
    const lessonsSnap = await doc0.ref.collection("lessons").get();
    res.json({ lessons: lessonsSnap.docs.map((d) => d.data()) });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// POST /markLessonDone { phone, lessonId }
router.post("/markLessonDone", async (req, res) => {
  try {
    const { phone, lessonId } = req.body as { phone: string; lessonId: string };
    assertString(phone, "phone");
    assertString(lessonId, "lessonId");
    const snap = await db
      .collection("users")
      .where("phone", "==", phone)
      .limit(1)
      .get();
    const doc0 = snap.docs[0];
    if (!doc0) return res.status(404).json({ error: "Not found" });
    const lessonRef = doc0.ref.collection("lessons").doc(lessonId);
    await lessonRef.set(
      { status: "done", completedAt: Date.now() },
      { merge: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// PUT /editProfile { phone, name, email }
router.put("/editProfile", async (req, res) => {
  try {
    const { phone, name, email } = req.body as {
      phone: string;
      name?: string;
      email?: string;
    };
    assertString(phone, "phone");
    if (email) assertEmail(email);
    const snap = await db
      .collection("users")
      .where("phone", "==", phone)
      .limit(1)
      .get();
    const doc0 = snap.docs[0];
    if (!doc0) return res.status(404).json({ error: "Not found" });
    await doc0.ref.update({
      ...(name ? { name } : {}),
      ...(email ? { email } : {}),
      updatedAt: Date.now(),
    });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

export default router;
