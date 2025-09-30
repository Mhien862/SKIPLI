import { Router } from "express";
import { db } from "../services/firebase";
import { sendSms } from "../services/twilio";
import { sendEmail } from "../services/mailer";
import {
  assertEmail,
  assertPhone,
  assertString,
  generateSixDigitCode,
} from "../utils/validators";
import { signToken } from "../middleware/auth";
import { UserProfile } from "../utils/types";
import bcrypt from "bcrypt";

const router = Router();

// POST /createAccessCode { phoneNumber }
router.post("/createAccessCode", async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    assertString(phoneNumber, "phoneNumber");
    assertPhone(phoneNumber);
    const code = generateSixDigitCode();

    const usersRef = db.collection("users");
    const snap = await usersRef
      .where("phone", "==", phoneNumber)
      .limit(1)
      .get();
    const userDoc = snap.docs[0]?.ref ?? usersRef.doc();
    const now = Date.now();
    const data: Partial<UserProfile> = {
      phone: phoneNumber,
      updatedAt: now,
      accessCode: code,
    } as any;
    await userDoc.set(
      {
        name: "",
        role: "student",
        email: "",
        createdAt: now,
        ...data,
      },
      { merge: true }
    );

    await sendSms(phoneNumber, `Your access code is ${code}`);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// POST /validateAccessCode { phoneNumber, accessCode }
router.post("/validateAccessCode", async (req, res) => {
  try {
    const { phoneNumber, accessCode } = req.body as {
      phoneNumber: string;
      accessCode: string;
    };
    assertString(phoneNumber, "phoneNumber");
    assertPhone(phoneNumber);
    assertString(accessCode, "accessCode");

    const usersRef = db.collection("users");
    const snap = await usersRef
      .where("phone", "==", phoneNumber)
      .limit(1)
      .get();
    const doc0 = snap.docs[0];
    if (!doc0) return res.status(400).json({ error: "User not found" });
    const user = doc0.data() as UserProfile;
    if (user.accessCode !== accessCode)
      return res.status(400).json({ error: "Invalid code" });

    await doc0.ref.update({ accessCode: "", updatedAt: Date.now() });
    const token = signToken({ phone: user.phone, role: user.role });
    res.json({ success: true, role: user.role, token });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// Student Email Login
// POST /student/loginEmail { email }
router.post("/student/loginEmail", async (req, res) => {
  try {
    const { email } = req.body as { email: string };
    assertString(email, "email");
    assertEmail(email);
    const code = generateSixDigitCode();

    // Find user by email
    const usersRef = db.collection("users");
    const snap = await usersRef.where("email", "==", email).limit(1).get();
    const doc0 = snap.docs[0];
    if (!doc0) return res.status(400).json({ error: "Student not found" });
    const ref = doc0.ref;
    await ref.update({ emailAccessCode: code, updatedAt: Date.now() });

    const appUrl = process.env.APP_URL || "http://localhost:5173";
    await sendEmail(
      email,
      "Your Login Code",
      `<p>Your access code is <b>${code}</b>.</p><p>Or click to continue: <a href="${appUrl}/verify-email?email=${encodeURIComponent(
        email
      )}">Verify Email</a></p>`
    );
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// POST /student/validateAccessCode { email, accessCode }
router.post("/student/validateAccessCode", async (req, res) => {
  try {
    const { email, accessCode } = req.body as {
      email: string;
      accessCode: string;
    };
    assertString(email, "email");
    assertEmail(email);
    assertString(accessCode, "accessCode");

    const usersRef = db.collection("users");
    const snap = await usersRef.where("email", "==", email).limit(1).get();
    const doc0 = snap.docs[0];
    if (!doc0) return res.status(400).json({ error: "Student not found" });
    const data = doc0.data() as UserProfile;
    if (data.emailAccessCode !== accessCode)
      return res.status(400).json({ error: "Invalid code" });
    await doc0.ref.update({ emailAccessCode: "", updatedAt: Date.now() });
    const token = signToken({ phone: data.phone, role: data.role });
    res.json({ success: true, token });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// POST /student/setupAccount { email, token, username, password }
router.post("/student/setupAccount", async (req, res) => {
  try {
    const { email, token, username, password } = req.body as {
      email: string;
      token: string;
      username: string;
      password: string;
    };
    assertString(email, "email");
    assertEmail(email);
    assertString(token, "token");
    assertString(username, "username");
    assertString(password, "password");

    const usersRef = db.collection("users");
    const snap = await usersRef.where("email", "==", email).limit(1).get();
    const doc0 = snap.docs[0];
    if (!doc0) return res.status(400).json({ error: "Student not found" });
    const ref = doc0.ref;
    const data = doc0.data() as any;
    if (data.setupToken !== token)
      return res.status(400).json({ error: "Invalid token" });
    const passwordHash = await bcrypt.hash(password, 10);
    await ref.update({
      username,
      passwordHash,
      setupToken: "",
      updatedAt: Date.now(),
    });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// POST /loginPassword { username, password }
router.post("/loginPassword", async (req, res) => {
  try {
    const { username, password } = req.body as {
      username: string;
      password: string;
    };
    assertString(username, "username");
    assertString(password, "password");
    const snap = await db
      .collection("users")
      .where("username", "==", username)
      .limit(1)
      .get();
    const doc0 = snap.docs[0];
    if (!doc0) return res.status(400).json({ error: "User not found" });
    const data = doc0.data() as any;
    const ok = await bcrypt.compare(password, data.passwordHash || "");
    if (!ok) return res.status(400).json({ error: "Invalid credentials" });
    const token = signToken({ phone: data.phone, role: data.role });
    res.json({ success: true, token, role: data.role });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

export default router;
