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
import { ConciergeController } from "../controllers/concierge.controller";
import { authGuard } from "../middlewares/auth.middleware";
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
apiRouter.post("/rsvp", validate(RsvpSchema), RsvpController.submit);
apiRouter.get("/rsvp/:cardId/stats", authGuard, RsvpController.getStats);

// --- WISHES ROUTES ---
apiRouter.post("/wishes", validate(WishSchema), WishController.submit);
apiRouter.get("/wishes/:cardId", WishController.list);

// --- GUEST MANAGEMENT ---
apiRouter.post("/cards/:cardId/guests/import", authGuard, GuestController.import); // Nhập danh sách khách
apiRouter.get("/cards/:cardId/guests", authGuard, GuestController.list); // Xem danh sách khách

// --- ORDER & PAYMENT ROUTES ---
apiRouter.post("/orders", authGuard, validate(CreateOrderSchema), OrderController.create);
apiRouter.get("/orders/:orderCode/status", OrderController.checkStatus);
apiRouter.post("/webhooks/sepay", OrderController.handleSepayWebhook);
