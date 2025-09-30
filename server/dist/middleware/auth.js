"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signToken = signToken;
exports.verifyToken = verifyToken;
exports.requireRole = requireRole;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function signToken(payload) {
    const secret = process.env.JWT_SECRET || "dev_secret";
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn: "7d" });
}
function verifyToken(req, res, next) {
    try {
        const header = req.headers["authorization"] || "";
        const token = header.startsWith("Bearer ") ? header.substring(7) : "";
        if (!token)
            return res.status(401).json({ error: "Missing token" });
        const secret = process.env.JWT_SECRET || "dev_secret";
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        req.auth = decoded;
        next();
    }
    catch (err) {
        return res.status(401).json({ error: "Invalid token" });
    }
}
function requireRole(role) {
    return (req, res, next) => {
        const auth = req.auth;
        if (!auth || auth.role !== role) {
            return res.status(403).json({ error: "Forbidden" });
        }
        next();
    };
}
//# sourceMappingURL=auth.js.map