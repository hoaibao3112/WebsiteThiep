import { Request, Response, NextFunction } from "express";
import { DomainService } from "../services/domain.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class DomainController {
  /**
   * GET /domains — Lấy danh sách tên miền và thông tin gói dịch vụ
   */
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const accountId = req.user?.accountId;
      if (!accountId) {
        return res.status(401).json({ success: false, error: "Vui lòng đăng nhập" });
      }

      const result = await DomainService.listDomains(accountId);
      return res.status(200).json({ success: true, data: result });
    } catch (error: unknown) {
      next(error);
    }
  }

  /**
   * POST /domains — Kết nối tên miền riêng cho thiệp cưới
   */
  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const accountId = req.user?.accountId;
      if (!accountId) {
        return res.status(401).json({ success: false, error: "Vui lòng đăng nhập" });
      }

      const result = await DomainService.createCustomDomain(accountId, req.body);
      return res.status(201).json({ success: true, data: result });
    } catch (error: unknown) {
      next(error);
    }
  }

  /**
   * POST /domains/:id/verify — Kích hoạt xác thực lại DNS và SSL cho tên miền
   */
  static async verify(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const accountId = req.user?.accountId;
      if (!accountId) {
        return res.status(401).json({ success: false, error: "Vui lòng đăng nhập" });
      }

      const domainId = String(req.params.id);
      const result = await DomainService.verifyDomain(accountId, domainId);
      return res.status(200).json({ success: true, data: result });
    } catch (error: unknown) {
      next(error);
    }
  }

  /**
   * DELETE /domains/:id — Gỡ bỏ tên miền riêng
   */
  static async remove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const accountId = req.user?.accountId;
      if (!accountId) {
        return res.status(401).json({ success: false, error: "Vui lòng đăng nhập" });
      }

      const domainId = String(req.params.id);
      const result = await DomainService.deleteCustomDomain(accountId, domainId);
      return res.status(200).json({ success: true, data: result, message: "Đã gỡ tên miền thành công" });
    } catch (error: unknown) {
      next(error);
    }
  }

  /**
   * PATCH /cards/:id/slug — Cập nhật slug đường dẫn thiệp cưới
   */
  static async updateSlug(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const accountId = req.user?.accountId;
      if (!accountId) {
        return res.status(401).json({ success: false, error: "Vui lòng đăng nhập" });
      }

      const cardId = String(req.params.id);
      const { slug } = req.body;
      const result = await DomainService.updateCardSlug(accountId, cardId, slug);
      return res.status(200).json({ success: true, data: result });
    } catch (error: unknown) {
      next(error);
    }
  }

  /**
   * GET /domains/lookup/:domain — Endpoint công khai tra cứu thiệp theo domain
   */
  static async lookupByDomain(req: Request, res: Response, next: NextFunction) {
    try {
      const domain = String(req.params.domain);
      const result = await DomainService.lookupCardByDomain(domain);
      return res.status(200).json({ success: true, data: result });
    } catch (error: unknown) {
      next(error);
    }
  }
}
