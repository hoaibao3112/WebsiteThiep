import { z } from "zod";

export const GuestSignatureSubmitSchema = z.object({
  signerName: z.string().trim().min(1, "Ten nguoi ky la bat buoc").max(100),
  signatureDataUrl: z.string().min(1, "Du lieu chu ky la bat buoc").max(2_000_000),
  message: z.string().trim().max(200).nullish(),
  guestToken: z.string().trim().min(1).max(128).nullish(),
});

export type GuestSignatureSubmitInput = z.infer<typeof GuestSignatureSubmitSchema>;