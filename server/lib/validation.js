import { z } from "zod";

const emailSchema = z.string().email().max(254);
const phoneSchema = z.string().min(6).max(30);
const labelSchema = z.string().min(2).max(500);

export const bookingCreateSchema = z.object({
  type: z.enum(["transfer", "hourly"]).default("transfer"),
  pickupAt: z.string().min(1),
  from: z.string().min(2).max(500).optional(),
  fromLabel: z.string().min(2).max(500).optional(),
  to: z.string().min(2).max(500).optional(),
  toLabel: z.string().min(2).max(500).optional(),
  durationHours: z.number().int().min(1).max(24).optional(),
  fromCoords: z.object({ lng: z.number(), lat: z.number() }).optional(),
  toCoords: z.object({ lng: z.number(), lat: z.number() }).optional(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().max(100).optional(),
  email: emailSchema,
  phone: phoneSchema,
  passengers: z.number().int().min(1).max(16).optional(),
  luggage: z.number().int().min(0).max(20).optional(),
  childSeat: z.number().int().min(0).max(4).optional(),
  vehicle: z.string().max(80).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  flightNumber: z.string().max(20).optional().nullable(),
  meetAndGreetName: z.string().max(120).optional().nullable(),
  returnTransfer: z.boolean().optional(),
  stops: z.array(z.string().max(500)).max(5).optional(),
  website: z.string().max(0).optional(), // honeypot — must be empty
}).superRefine((data, ctx) => {
  const from = (data.from || data.fromLabel || "").trim();
  if (!from) {
    ctx.addIssue({ code: "custom", message: "INVALID_FROM", path: ["from"] });
  }
  if (data.type === "transfer") {
    const to = (data.to || data.toLabel || "").trim();
    if (!to) {
      ctx.addIssue({ code: "custom", message: "INVALID_TO", path: ["to"] });
    }
  }
  if (data.type === "hourly" && (data.durationHours == null || data.durationHours < 1)) {
    ctx.addIssue({ code: "custom", message: "INVALID_DURATION", path: ["durationHours"] });
  }
});

export const enquiryCreateSchema = z.object({
  name: z.string().min(2).max(120),
  email: emailSchema,
  phone: z.string().max(30).optional().nullable(),
  message: z.string().min(5).max(3000),
  website: z.string().max(0).optional(), // honeypot
});

export const transferSchema = z.object({
  flightCode: z.string().max(20).optional().nullable(),
  fromLabel: z.string().max(500).default(""),
  toLabel: z.string().max(500).default(""),
  fromLng: z.number().optional().nullable(),
  fromLat: z.number().optional().nullable(),
  toLng: z.number().optional().nullable(),
  toLat: z.number().optional().nullable(),
  transferDate: z.string().min(1),
  transferTime: z.string().max(10).optional().nullable(),
  type: z.enum(["arrival", "departure", "internal"]).default("arrival"),
  sortOrder: z.number().int().min(0).optional(),
  notes: z.string().max(2000).optional().nullable(),
});

export const passengerSchema = z.object({
  firstName: z.string().max(100).default(""),
  lastName: z.string().max(100).optional().nullable(),
  identityNumber: z.string().max(50).optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
});

export const reservationCreateSchema = z.object({
  status: z.enum(["pending", "confirmed", "in_progress", "completed", "cancelled"]).optional(),
  supplierId: z.string().optional().nullable(),
  supplierPrice: z.number().min(0).optional().nullable(),
  supplierCurrency: z.string().max(5).optional(),
  supplierPaymentStatus: z.enum(["unpaid", "paid", "partial"]).optional(),
  supplierPaymentType: z.string().max(50).optional().nullable(),
  supplierPaymentDate: z.string().optional().nullable(),
  supplierNote: z.string().max(2000).optional().nullable(),
  customerId: z.string().optional().nullable(),
  salePrice: z.number().min(0).optional().nullable(),
  saleCurrency: z.string().max(5).optional(),
  customerPaymentStatus: z.enum(["unpaid", "paid", "partial"]).optional(),
  customerPaymentType: z.string().max(50).optional().nullable(),
  customerPaymentDate: z.string().optional().nullable(),
  customerNote: z.string().max(2000).optional().nullable(),
  assignedVehicleId: z.string().optional().nullable(),
  assignedDriverId: z.string().optional().nullable(),
  transfers: z.array(transferSchema).optional(),
  passengers: z.array(passengerSchema).optional(),
});

export const customerCreateSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().max(100).optional().nullable(),
  email: z.string().email().max(254).optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  identityNo: z.string().max(50).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const supplierCreateSchema = z.object({
  name: z.string().min(1).max(200),
  phone: z.string().max(30).optional().nullable(),
  email: z.string().email().max(254).optional().nullable(),
  contactName: z.string().max(100).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  cityId: z.string().optional().nullable(),
});

export function parseBody(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) {
    const issue = result.error.issues[0];
    const code = issue?.message?.startsWith("INVALID_") ? issue.message : "VALIDATION";
    return { ok: false, error: code, details: result.error.flatten() };
  }
  return { ok: true, data: result.data };
}
