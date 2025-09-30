import { Request, Response, NextFunction } from "express";
export interface AuthPayload {
    phone: string;
    role: "instructor" | "student";
}
export declare function signToken(payload: AuthPayload): string;
export declare function verifyToken(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
export declare function requireRole(role: AuthPayload["role"]): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=auth.d.ts.map