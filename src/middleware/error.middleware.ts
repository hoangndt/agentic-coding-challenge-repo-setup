import type { NextFunction, Request, Response } from "express";
import { DomainError } from "../utils/errors";

export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof DomainError) {
    res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
    return;
  }
  console.error(err);
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Internal server error" } });
}
