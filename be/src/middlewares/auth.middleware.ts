import { Request, Response, NextFunction } from "express";
import { AuthService, TokenPayload } from "../services/auth.service";
import { prisma } from "../lib/prisma";
import { AccountMemberRole } from "@prisma/client";
import { COOKIE_OPTIONS, CSRF_COOKIE_OPTIONS } from "../config/security";

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
  userId?: string;
  accountMemberRole?: AccountMemberRole;
}

export async function authGuard(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies && req.cookies.auth_token) {
      token = req.cookies.auth_token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Vui lòng đăng nhập để tiếp tục",
      });
    }

    const decoded = AuthService.verifyToken(token);
    const membership = await prisma.accountMember.findUnique({
      where: { accountId_userId: { accountId: decoded.accountId, userId: decoded.userId } },
      select: { id: true, role: true },
    });
    if (!membership) {
      if (req.cookies?.auth_token) {
        res.clearCookie("auth_token", COOKIE_OPTIONS);
        res.clearCookie("csrf_token", CSRF_COOKIE_OPTIONS);
      }
      return res.status(401).json({ success: false, error: "Phiên đăng nhập không còn quyền truy cập tài khoản" });
    }
    req.user = decoded;
    req.userId = decoded.userId;
    req.accountMemberRole = membership.role;

    next();
  } catch (error) {
    if (req.cookies?.auth_token) {
      res.clearCookie("auth_token", COOKIE_OPTIONS);
      res.clearCookie("csrf_token", CSRF_COOKIE_OPTIONS);
    }
    return res.status(401).json({
      success: false,
      error: "Phiên đăng nhập đã hết hạn hoặc không hợp lệ",
    });
  }
}

export async function optionalAuthGuard(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies && req.cookies.auth_token) {
      token = req.cookies.auth_token;
    }

    if (token) {
      const decoded = AuthService.verifyToken(token);
      const membership = await prisma.accountMember.findUnique({
        where: { accountId_userId: { accountId: decoded.accountId, userId: decoded.userId } },
        select: { id: true, role: true },
      });
      if (membership) {
        req.user = decoded;
        req.userId = decoded.userId;
        req.accountMemberRole = membership.role;
      }
    }
    next();
  } catch {
    next();
  }
}

export function adminGuard(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  authGuard(req, res, () => {
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        error: "Bạn không có quyền quản trị viên",
      });
    }
    next();
  });
}

/**
 * Post-auth guard: requires OWNER membership role.
 * Must be used AFTER authGuard (which populates accountMemberRole).
 */
export function ownerGuard(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (req.accountMemberRole !== "OWNER") {
    return res.status(403).json({
      success: false,
      error: "Chỉ chủ tài khoản (OWNER) mới có thể thực hiện thao tác này",
      code: "OWNER_REQUIRED",
    });
  }
  next();
}

