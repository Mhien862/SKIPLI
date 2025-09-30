"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timestamp = exports.FieldValue = exports.db = void 0;
exports.isFirebaseInitialized = isFirebaseInitialized;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
function loadServiceAccount() {
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
    }
    catch (err) {
        throw new Error("Failed to parse FIREBASE_SERVICE_ACCOUNT JSON: " + err.message);
    }
}
let appInitialized = false;
if (!firebase_admin_1.default.apps.length) {
    const serviceAccount = loadServiceAccount();
    firebase_admin_1.default.initializeApp({
        credential: firebase_admin_1.default.credential.cert(serviceAccount),
    });
    appInitialized = true;
}
exports.db = firebase_admin_1.default.firestore();
exports.FieldValue = firebase_admin_1.default.firestore.FieldValue;
exports.Timestamp = firebase_admin_1.default.firestore.Timestamp;
function isFirebaseInitialized() {
    return appInitialized || firebase_admin_1.default.apps.length > 0;
}
//# sourceMappingURL=firebase.js.map