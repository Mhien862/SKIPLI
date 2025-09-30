import admin from "firebase-admin";

type ServiceAccount = {
  project_id: string;
  client_email: string;
  private_key: string;
};

function loadServiceAccount(): ServiceAccount {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT is required in environment");
  }
  try {
    const parsed = JSON.parse(raw);
    if (!parsed.private_key || !parsed.client_email || !parsed.project_id) {
      throw new Error("Invalid Firebase service account JSON");
    }
    // Fix escaped newlines in private key if present
    parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
    return parsed;
  } catch (err) {
    throw new Error("Failed to parse FIREBASE_SERVICE_ACCOUNT JSON: " + (err as Error).message);
  }
}

let appInitialized = false;
if (!admin.apps.length) {
  const serviceAccount = loadServiceAccount();
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
  appInitialized = true;
}

export const db = admin.firestore();
export const FieldValue = admin.firestore.FieldValue;
export const Timestamp = admin.firestore.Timestamp;

export function isFirebaseInitialized(): boolean {
  return appInitialized || admin.apps.length > 0;
}


