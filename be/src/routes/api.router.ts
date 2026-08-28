import { Router } from "express";
import multer from "multer";
import { AuthController } from "../controllers/auth.controller";
import { CardController } from "../controllers/card.controller";
import { RsvpController } from "../controllers/rsvp.controller";
import { WishController } from "../controllers/wish.controller";
import { OrderController } from "../controllers/order.controller";
import { GuestController } from "../controllers/guest.controller";
import { ExportController } from "../controllers/export.controller";
import { MediaController } from "../controllers/media.controller";
import { authGuard } from "../middlewares/auth.middleware";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // Max 10MB
});

export const apiRouter = Router();

// --- AUTH ROUTES ---
apiRouter.post("/auth/register", AuthController.register);
apiRouter.post("/auth/login", AuthController.login);
apiRouter.get("/auth/me", authGuard, AuthController.getMe);
apiRouter.put("/auth/profile", authGuard, AuthController.updateProfile);

// --- MEDIA UPLOAD ---
apiRouter.post(
  "/media/upload",
  authGuard,
  upload.single("file"),
  MediaController.upload
);

// --- CARD ROUTES ---
apiRouter.post("/cards", authGuard, CardController.upsert); // Tạo mới thiệp
apiRouter.put("/cards/:id", authGuard, CardController.upsert); // Cập nhật thiệp
apiRouter.get("/cards/my-cards", authGuard, CardController.getUserCards); // Danh sách thiệp của Host
apiRouter.get("/cards/by-slug/:slug", CardController.getBySlug); // Đọc thiệp công khai (Public)
apiRouter.patch("/cards/:id/publish", authGuard, CardController.publish); // Xuất bản thiệp
apiRouter.get("/cards/:cardId/export-excel", authGuard, ExportController.exportExcel); // Xuất Excel RSVP

// --- RSVP ROUTES ---
apiRouter.post("/rsvp", RsvpController.submit); // Khách gửi xác nhận tham gia (Public)
apiRouter.get("/rsvp/:cardId/stats", authGuard, RsvpController.getStats); // Host xem thống kê RSVP

// --- WISHES ROUTES ---
apiRouter.post("/wishes", WishController.submit); // Khách gửi lời chúc (Public)
apiRouter.get("/wishes/:cardId", WishController.list); // Danh sách lời chúc phân trang (Public)

// --- GUEST MANAGEMENT ---
apiRouter.post("/cards/:cardId/guests/import", authGuard, GuestController.import); // Nhập danh sách khách
apiRouter.get("/cards/:cardId/guests", authGuard, GuestController.list); // Xem danh sách khách

// --- ORDER & PAYMENT ROUTES ---
apiRouter.post("/orders", authGuard, OrderController.create); // Tạo đơn nâng cấp gói
apiRouter.get("/orders/:orderCode/status", OrderController.checkStatus); // Polling kiểm tra thanh toán
apiRouter.post("/webhooks/sepay", OrderController.handleSepayWebhook); // Webhook SePay VietQR
