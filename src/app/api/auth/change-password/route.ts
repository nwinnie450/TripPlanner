import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCollection } from "@/lib/mongodb";
import {
  getSessionUser,
  verifyPassword,
  hashPassword,
} from "@/lib/auth";
import { ApiError, handleApiError } from "@/lib/errors";
import { rateLimitGeneral } from "@/lib/rate-limit";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(6, "New password must be at least 6 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const rl = rateLimitGeneral(ip);
    if (!rl.allowed) {
      throw new ApiError("RATE_LIMITED", "Too many requests", 429);
    }

    const session = await getSessionUser();
    if (!session) {
      throw new ApiError("UNAUTHORIZED", "Not authenticated", 401);
    }

    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        "VALIDATION_ERROR",
        parsed.error.issues.map((i) => i.message).join(", "),
        400,
      );
    }

    const collection = await getCollection("users");
    const user = await collection.findOne({ userId: session.userId });
    if (!user) {
      throw new ApiError("NOT_FOUND", "User not found", 404);
    }

    const valid = await verifyPassword(
      parsed.data.currentPassword,
      user.passwordHash,
    );
    if (!valid) {
      throw new ApiError(
        "INVALID_PASSWORD",
        "Current password is incorrect",
        400,
      );
    }

    const newHash = await hashPassword(parsed.data.newPassword);
    await collection.updateOne(
      { userId: session.userId },
      { $set: { passwordHash: newHash, updatedAt: new Date().toISOString() } },
    );

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
