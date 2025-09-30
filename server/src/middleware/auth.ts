import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthPayload {
  phone: string;
  role: "instructor" | "student";
}

export function signToken(payload: AuthPayload): string {
  const secret = process.env.JWT_SECRET || "dev_secret";
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers["authorization"] || "";
    const token = header.startsWith("Bearer ") ? header.substring(7) : "";
    if (!token) return res.status(401).json({ error: "Missing token" });
    const secret = process.env.JWT_SECRET || "dev_secret";
    const decoded = jwt.verify(token, secret) as AuthPayload;
    (req as any).auth = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function requireRole(role: AuthPayload["role"]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const auth = (req as any).auth as AuthPayload | undefined;
    if (!auth || auth.role !== role) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}
