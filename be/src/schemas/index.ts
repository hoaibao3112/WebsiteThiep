import { z } from "zod";

// -----------------------------------------------------------------------
// AUTH SCHEMAS (canonical source: ../lib/validators/auth.schema)
// -----------------------------------------------------------------------

export {
  SendOtpSchema,
  VerifyOtpRegisterSchema,
  VerifyOtpRegisterSchema as RegisterWithOtpSchema,
  RegisterSchema,
  LoginSchema,
  GoogleLoginSchema,
  UpdateProfileSchema,
} from "../lib/validators/auth.schema";

export type {
  SendOtpInput,
  VerifyOtpRegisterInput,
  VerifyOtpRegisterInput as RegisterWithOtpInput,
  RegisterInput,
  LoginInput,
  GoogleLoginInput,
  UpdateProfileInput,
} from "../lib/validators/auth.schema";

// -----------------------------------------------------------------------
// RSVP SCHEMAS (canonical source: ../lib/validators/rsvp.schema)
// -----------------------------------------------------------------------

export {
  RsvpSubmitSchema,
  RsvpSubmitSchema as RsvpSchema,
} from "../lib/validators/rsvp.schema";

export type {
  RsvpSubmitInput,
  RsvpSubmitInput as RsvpInput,
} from "../lib/validators/rsvp.schema";

// -----------------------------------------------------------------------
// WISH SCHEMA (re-exported from canonical source)
// -----------------------------------------------------------------------

export {
  WishSubmitSchema as WishSchema,
  type WishSubmitInput as WishInput,
} from "../lib/validators/wish.schema";

// -----------------------------------------------------------------------
// ORDER SCHEMA (re-exported from canonical source)
// -----------------------------------------------------------------------

export {
  CreateOrderSchema,
  ApproveOrderSchema,
  RejectOrderSchema,
  AdminListQuerySchema,
  SubmitTransferParamsSchema,
} from "../lib/validators/order.schema";

// -----------------------------------------------------------------------
// CONCIERGE SCHEMA
// -----------------------------------------------------------------------

export const ConciergeSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải ít nhất 2 ký tự").max(100),
  phone: z.string().regex(/^(0[3|5|7|8|9])+([0-9]{8})\b/, "Số điện thoại không hợp lệ"),
  email: z.string().email().optional(),
  servicePackage: z.string().max(100).optional(),
  favoriteTemplate: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
});

// -----------------------------------------------------------------------
// EXPORT ALL TYPES
// -----------------------------------------------------------------------
export type ConciergeInput = z.infer<typeof ConciergeSchema>;

export type {
  CreateOrderInput,
  ApproveOrderInput,
  RejectOrderInput,
  AdminListQuery,
  SubmitTransferParams,
} from "../lib/validators/order.schema";

