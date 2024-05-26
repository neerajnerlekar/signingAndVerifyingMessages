import { z } from "zod";

export const schema = z.object({
  senderAddress: z.string().nonempty(),
  toAddress: z.string().nonempty(),
  amount: z.number().int().min(0, {
    message: "Amount must be a positive integer",
  }),
  message: z.string().trim().min(1, {
    message: "Message must not be empty",
  }),
  nonce: z.number().int().min(0, {
    message: "Nonce must be a positive integer",
  }),
  signature: z.string().nonempty(),
});

export const signSchema = z.object({
  toAddress: z.string().nonempty(),
  amount: z.number().int().min(0, {
    message: "Amount must be a positive integer",
  }),
  message: z.string().trim().min(1, {
    message: "Message must not be empty",
  }),
  nonce: z.number().int().min(0, {
    message: "Nonce must be a positive integer",
  }),
});
