/**
 * Order form validation — zod schemas shared by client and server.
 * The server always recomputes prices and never trusts client-sent amounts.
 */

import { z } from "zod";
import { PRODUCT_IDS, type ProductId } from "@/config/products";
import { DENSITY_VALUES, QUANTITY_MAX, QUANTITY_MIN, THICKNESS_CM } from "@/config/site";
import { normalizePhone } from "./normalize";

export const densitySchema = z
  .number()
  .refine((v): v is (typeof DENSITY_VALUES)[number] =>
    (DENSITY_VALUES as number[]).includes(v),
    { message: "invalid-density" });

export const thicknessSchema = z
  .number()
  .refine((v): v is (typeof THICKNESS_CM)[number] =>
    (THICKNESS_CM as readonly number[]).includes(v),
    { message: "invalid-thickness" });

export const orderSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    phone: z
      .string()
      .transform((v, ctx) => {
        const normalized = normalizePhone(v);
        if (!normalized) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "invalid-phone" });
          return z.NEVER;
        }
        return normalized;
      }),
    productId: z.enum(PRODUCT_IDS as [ProductId, ...ProductId[]]),
    density: z.number().nullable().optional(),
    thickness: z.number().nullable().optional(),
    quantity: z.number().int().min(QUANTITY_MIN).max(QUANTITY_MAX),
    note: z.string().trim().max(500).optional(),
  })
  .superRefine((data, ctx) => {
    const crushed = data.productId === "maydalangan";
    if (!crushed) {
      if (data.density == null || !(DENSITY_VALUES as number[]).includes(data.density)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["density"], message: "invalid-density" });
      }
      if (data.thickness == null || !(THICKNESS_CM as readonly number[]).includes(data.thickness)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["thickness"], message: "invalid-thickness" });
      }
    }
  });

export type OrderInput = z.input<typeof orderSchema>;
export type OrderData = z.output<typeof orderSchema>;

/** Telegram-side shape: what the API handler expects over the wire. */
export const orderRequestSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().min(3).max(24),
  productId: z.enum(PRODUCT_IDS as [ProductId, ...ProductId[]]),
  density: z.number().nullable().optional(),
  thickness: z.number().nullable().optional(),
  quantity: z.number().int().min(QUANTITY_MIN).max(QUANTITY_MAX),
  note: z.string().trim().max(500).optional(),
  // Accepted and IGNORED — the server recomputes the price.
  price: z.unknown().optional(),
  total: z.unknown().optional(),
  lang: z.enum(["uz", "ru", "en"]).optional(),
});

export type OrderRequest = z.infer<typeof orderRequestSchema>;
