import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCollection } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/auth";
import { ApiError, handleApiError } from "@/lib/errors";
import { rateLimitGeneral } from "@/lib/rate-limit";

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const collection = await getCollection("users");
  const user = await collection.findOne({ userId: session.userId });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }

  return NextResponse.json({
    userId: user.userId,
    email: user.email,
    name: user.name,
  });
}

const updateNameSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(50, "Name too long"),
});

export async function PATCH(request: NextRequest) {
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
    const parsed = updateNameSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        "VALIDATION_ERROR",
        parsed.error.issues.map((i) => i.message).join(", "),
        400,
      );
    }

    const collection = await getCollection("users");
    const result = await collection.findOneAndUpdate(
      { userId: session.userId },
      { $set: { name: parsed.data.name, updatedAt: new Date().toISOString() } },
      { returnDocument: "after" },
    );

    if (!result) {
      throw new ApiError("NOT_FOUND", "User not found", 404);
    }

    return NextResponse.json({
      userId: result.userId,
      email: result.email,
      name: result.name,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
