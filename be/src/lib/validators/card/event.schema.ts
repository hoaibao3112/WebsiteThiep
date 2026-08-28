import { z } from "zod";

export const EventSchema = z.object({
  eventName: z.string().min(2, "Tên sự kiện phải có ít nhất 2 ký tự"),
  eventDate: z.coerce.date({ required_error: "Vui lòng chọn ngày giờ tổ chức" }),
  lunarDate: z.string().optional(),
  venueName: z.string().min(2, "Vui lòng nhập tên địa điểm/nhà hàng/tư gia"),
  address: z.string().min(5, "Vui lòng nhập địa chỉ chi tiết"),
  mapUrl: z.string().url("Link bản đồ không hợp lệ").optional().or(z.literal("")),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  sortOrder: z.number().int().default(0),
});

export type EventInput = z.infer<typeof EventSchema>;
