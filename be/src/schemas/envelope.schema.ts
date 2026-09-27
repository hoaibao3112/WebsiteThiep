import { z } from "zod";

export const EnvelopeStyleSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  envelopeColor: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/),
  flapColor: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/),
  innerColor: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/),
  sealColor: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/),
  sealBorderColor: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/),
  monogramColor: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/),
  bgTexture: z.string().trim().default("vintage-linen"),
  bgColor: z.string().trim().default("#EFEBE4"),
  decorStyle: z.string().trim().default("blue-hydrangea"),
  defaultTitle: z.string().trim().default("We're getting married!"),
  defaultFont: z.string().trim().default("Aquarelle"),
  defaultButtonText: z.string().trim().default("CHẠM ĐỂ MỞ"),
  isVip: z.boolean().default(false),
});

export type EnvelopeStyle = z.infer<typeof EnvelopeStyleSchema>;

export const EnvelopeConfigSchema = z.object({
  styleId: z.string().trim().min(1).default("vintage-cream"),
  styleName: z.string().trim().optional(),
  groomName: z.string().trim().max(100).default(""),
  brideName: z.string().trim().max(100).default(""),
  title: z.string().trim().max(150).default("We're getting married!"),
  fontFamily: z.string().trim().max(100).default("Aquarelle"),
  buttonText: z.string().trim().max(50).default("CHẠM ĐỂ MỞ"),
  monogram: z.string().trim().max(10).optional(),
});

export type EnvelopeConfig = z.infer<typeof EnvelopeConfigSchema>;
