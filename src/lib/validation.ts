import { z } from "zod/v4";
import {
  EXPENSE_CATEGORIES,
  ITINERARY_CATEGORIES,
  MEMBER_LIMIT,
} from "./constants";

export const createTripSchema = z
  .object({
    tripName: z.string().min(1).max(100),
    startDate: z.iso.date(),
    endDate: z.iso.date(),
    currency: z.string().min(3).max(3),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be on or after start date",
    path: ["endDate"],
  });

export const signupSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(50),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const addMemberSchema = z.object({
  name: z.string().min(1).max(50),
  userId: z.string().optional(),
});

export const addItineraryItemSchema = z.object({
  dayDate: z.iso.date(),
  time: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
    .optional()
    .or(z.literal("")),
  title: z.string().min(1).max(200),
  location: z.string().max(200).optional().default(""),
  locationLat: z.number().min(-90).max(90).optional(),
  locationLng: z.number().min(-180).max(180).optional(),
  category: z
    .enum(ITINERARY_CATEGORIES as [string, ...string[]])
    .optional(),
  notes: z.string().max(500).optional().default(""),
  createdBy: z.string().min(1),
});

export const TRANSPORT_MODES = [
  "DRIVING",
  "WALKING",
  "TRANSIT",
  "BICYCLING",
] as const;

export const updateItineraryItemSchema = z.object({
  dayDate: z.iso.date().optional(),
  time: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
    .optional()
    .or(z.literal("")),
  title: z.string().min(1).max(200).optional(),
  location: z.string().max(200).optional(),
  locationLat: z.number().min(-90).max(90).optional(),
  locationLng: z.number().min(-180).max(180).optional(),
  category: z
    .enum(ITINERARY_CATEGORIES as [string, ...string[]])
    .optional(),
  transportMode: z
    .enum(TRANSPORT_MODES as unknown as [string, ...string[]])
    .optional(),
  notes: z.string().max(500).optional(),
});

export const addExpenseSchema = z.object({
  amount: z.number().positive(),
  description: z.string().min(1).max(200),
  category: z.enum(EXPENSE_CATEGORIES as [string, ...string[]]),
  paidBy: z.string().min(1),
  splitBetween: z.array(z.string().min(1)).min(1).max(MEMBER_LIMIT),
  date: z.iso.date(),
  createdBy: z.string().min(1),
});

export const updateExpenseSchema = z.object({
  amount: z.number().positive().optional(),
  description: z.string().min(1).max(200).optional(),
  category: z.enum(EXPENSE_CATEGORIES as [string, ...string[]]).optional(),
  paidBy: z.string().min(1).optional(),
  splitBetween: z
    .array(z.string().min(1))
    .min(1)
    .max(MEMBER_LIMIT)
    .optional(),
  date: z.iso.date().optional(),
});

export const updateBudgetSchema = z.object({
  budget: z.number().min(0),
});

export type CreateTripInput = z.infer<typeof createTripSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type AddItineraryItemInput = z.infer<typeof addItineraryItemSchema>;
export type UpdateItineraryItemInput = z.infer<
  typeof updateItineraryItemSchema
>;
export type AddExpenseInput = z.infer<typeof addExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
