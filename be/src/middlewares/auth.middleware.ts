import { Request, Response, NextFunction } from "express";
import { AuthService, TokenPayload } from "../services/auth.service";

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export function authGuard(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Vui lòng đăng nhập để tiếp tục",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = AuthService.verifyToken(token);
    req.user = decoded;
    (req as any).userId = decoded.userId;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Phiên đăng nhập đã hết hạn hoặc không hợp lệ",
    });
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
