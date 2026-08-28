import type { NextFunction, Request, Response } from "express";
import { supabase } from "../config/supabase.js";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Authentication required",
    });
  }

  const token = authorization.slice("Bearer ".length);

  const { data, error } = await supabase.auth.getClaims(token);

  if (error || !data?.claims?.sub) {
    return res.status(401).json({
      error: "Invalid or expired authentication token",
    });
  }

  res.locals.supabaseUserId = data.claims.sub;

  return next();
}
