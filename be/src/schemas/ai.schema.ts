import { z } from 'zod';

export const AiChatSchema = z.object({
  message: z.string().trim().min(1, 'Tin nhắn không được để trống').max(2000, 'Tin nhắn quá dài (tối đa 2000 ký tự)'),
  sessionId: z.string().trim().min(1).max(100).optional(),
});

export type AiChatInput = z.infer<typeof AiChatSchema>;
