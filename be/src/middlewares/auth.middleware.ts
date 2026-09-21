import { Request, Response, NextFunction } from "express";
import { AuthService, TokenPayload } from "../services/auth.service";
import { prisma } from "../lib/prisma";

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
  userId?: string;
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
      select: { id: true },
    });
    if (!membership) {
      return res.status(401).json({ success: false, error: "Phiên đăng nhập không còn quyền truy cập tài khoản" });
    }
    req.user = decoded;
    req.userId = decoded.userId;

    next();
  } catch (error) {
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
        select: { id: true },
      });
      if (membership) {
        req.user = decoded;
        req.userId = decoded.userId;
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
