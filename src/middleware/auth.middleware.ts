import type { NextFunction, Request, Response } from "express";

export interface AuthUser {
  id: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// Mock authentication: every request is treated as this user.
export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  req.user = { id: "user-123", role: "customer" };
  next();
}
