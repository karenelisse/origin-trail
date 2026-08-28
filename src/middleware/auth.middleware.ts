import type { NextFunction, Request, Response } from "express";
import { supabase } from "../config/supabase.js";
import { getUserBySupabaseId } from "../services/user.service.js";

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

export async function requireApprovedUser(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  const supabaseUserId = res.locals.supabaseUserId;

  if (!supabaseUserId) {
    return res.status(401).json({
      error: "Authentication required",
    });
  }

  try {
    const user = await getUserBySupabaseId(supabaseUserId);

    if (!user || user.access_level === "unapproved") {
      return res.status(403).json({
        error: "Origin Trail access has not been approved",
      });
    }

    res.locals.user = user;

    return next();
  } catch (error) {
    console.error("Unable to check user permissions:", error);

    return res.status(500).json({
      error: "Unable to check user permissions",
    });
  }
}
