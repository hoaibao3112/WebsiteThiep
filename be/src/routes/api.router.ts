import { Router } from "express";
import multer from "multer";
import { AuthController } from "../controllers/auth.controller";
import { CardController } from "../controllers/card.controller";
import { RsvpController } from "../controllers/rsvp.controller";
import { WishController } from "../controllers/wish.controller";
import { OrderController } from "../controllers/order.controller";
import { BillingController } from "../controllers/billing.controller";
import { AdminPaymentController } from "../controllers/admin-payment.controller";
import { GuestController } from "../controllers/guest.controller";
import { ExportController } from "../controllers/export.controller";
import { MediaController } from "../controllers/media.controller";
import { ConciergeController } from "../controllers/concierge.controller";
import { authGuard, adminGuard, ownerGuard } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { csrfGuard } from "../middlewares/csrf.middleware";
import {
  SendOtpSchema,
  RegisterWithOtpSchema,
  LoginSchema,
  GoogleLoginSchema,
  UpdateProfileSchema,
  RsvpSchema,
  WishSchema,
  CreateOrderSchema,
  ConciergeSchema,
} from "../schemas";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // Max 10MB
});

export const apiRouter = Router();
apiRouter.use(csrfGuard);

// --- CONCIERGE / THIẾT KẾ RIÊNG ---
apiRouter.post("/concierge/submit", validate(ConciergeSchema), ConciergeController.submit);

// --- AUTH ROUTES ---
apiRouter.post("/auth/send-otp", validate(SendOtpSchema), AuthController.sendOtp);
apiRouter.post("/auth/verify-otp-register", validate(RegisterWithOtpSchema), AuthController.registerWithOtp);
apiRouter.post("/auth/google", validate(GoogleLoginSchema), AuthController.googleLogin);
apiRouter.post("/auth/register", validate(LoginSchema), AuthController.register);
apiRouter.post("/auth/login", validate(LoginSchema), AuthController.login);
apiRouter.post("/auth/logout", AuthController.logout);
apiRouter.get("/auth/me", authGuard, AuthController.getMe);

apiRouter.put("/auth/profile", authGuard, validate(UpdateProfileSchema), AuthController.updateProfile);

// --- USER WEDDING PROFILE (HỒ SƠ CƯỚI TỰ ĐỘNG ĐIỀN) ---
apiRouter.get("/user/wedding-profile", authGuard, AuthController.getWeddingProfile);
apiRouter.put("/user/wedding-profile", authGuard, AuthController.updateWeddingProfile);

// --- MEDIA UPLOAD ---
apiRouter.post(
  "/media/upload",
  authGuard,
  upload.single("file"),
  MediaController.upload
);

// --- CARD ROUTES ---
apiRouter.get("/templates/:slug/wedding-scene", CardController.getWeddingScenePreview);
apiRouter.post("/cards", authGuard, CardController.create); // Tạo bản nháp FREE
apiRouter.get("/cards/my-cards", authGuard, CardController.getUserCards); // Danh sách thiệp của Host
apiRouter.get("/cards/slug-availability", authGuard, CardController.slugAvailability);
apiRouter.get("/cards/by-slug/:slug", CardController.getBySlug); // Đọc thiệp công khai (Public)
apiRouter.get("/cards/:id", authGuard, CardController.getOwner);
apiRouter.put("/cards/:id", authGuard, CardController.update); // Cập nhật thiệp
apiRouter.patch("/cards/:id/publish", authGuard, CardController.publish); // Xuất bản thiệp
apiRouter.delete("/cards/:id", authGuard, CardController.remove);
apiRouter.get("/cards/:cardId/export-excel", authGuard, ExportController.exportExcel); // Xuất Excel RSVP

// --- RSVP ROUTES ---
apiRouter.post("/rsvp", validate(RsvpSchema), RsvpController.submit);
apiRouter.get("/rsvp/:cardId/stats", authGuard, RsvpController.getStats);

// --- WISHES ROUTES ---
apiRouter.post("/wishes", validate(WishSchema), WishController.submit);
apiRouter.get("/wishes/:cardId", WishController.list);

// --- GUEST MANAGEMENT ---
apiRouter.post("/cards/:cardId/guests/import", authGuard, GuestController.import); // Nhập danh sách khách
apiRouter.get("/cards/:cardId/guests", authGuard, GuestController.list); // Xem danh sách khách
apiRouter.post("/cards/:cardId/guests", authGuard, GuestController.create);
apiRouter.delete("/cards/:cardId/guests", authGuard, GuestController.clear);
apiRouter.patch("/cards/:cardId/guests/:guestId/delivery", authGuard, GuestController.delivery);
apiRouter.post("/cards/:cardId/guests/:guestId/regenerate-token", authGuard, GuestController.regenerateToken);
apiRouter.put("/cards/:cardId/guests/:guestId", authGuard, GuestController.update);
apiRouter.delete("/cards/:cardId/guests/:guestId", authGuard, GuestController.remove);

// --- BILLING & PLAN CATALOG ---
apiRouter.get("/plans", BillingController.getPlans); // Public: active Plan catalog
apiRouter.get("/billing/summary", authGuard, BillingController.getSummary); // Authenticated: billing summary

// --- ORDER & PAYMENT ROUTES (OWNER) ---
apiRouter.post("/orders", authGuard, ownerGuard, validate(CreateOrderSchema), OrderController.create);
apiRouter.post("/orders/:orderId/submit-transfer", authGuard, ownerGuard, OrderController.submitTransfer);
apiRouter.get("/orders/:orderId", authGuard, OrderController.getOrder);
apiRouter.get("/orders/:orderCode/status", OrderController.checkStatus); // Legacy polling

// --- ADMIN: PAYMENT REVIEW ---
apiRouter.get("/admin/payment-orders", adminGuard, AdminPaymentController.listQueue);
apiRouter.get("/admin/payment-orders/:orderId", adminGuard, AdminPaymentController.getDetail);
apiRouter.post("/admin/payment-orders/:orderId/approve", adminGuard, AdminPaymentController.approve);
apiRouter.post("/admin/payment-orders/:orderId/reject", adminGuard, AdminPaymentController.reject);
