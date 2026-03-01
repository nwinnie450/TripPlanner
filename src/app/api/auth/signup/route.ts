import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { signupSchema } from "@/lib/validation";
import { hashPassword, createSession, sessionCookieOptions } from "@/lib/auth";
import { ApiError, handleApiError } from "@/lib/errors";
import { generateId } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        "VALIDATION_ERROR",
        parsed.error.issues.map((i) => i.message).join(", "),
        400,
      );
    }

    const email = parsed.data.email.toLowerCase().trim();
    const collection = await getCollection("users");

    const existing = await collection.findOne({ email });
    if (existing) {
      throw new ApiError(
        "EMAIL_EXISTS",
        "An account with this email already exists",
        409,
      );
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const userId = generateId();
    const now = new Date().toISOString();

    await collection.insertOne({
      userId,
      email,
      passwordHash,
      name: parsed.data.name.trim(),
      createdAt: now,
      updatedAt: now,
    });

    const token = await createSession(userId);
    const response = NextResponse.json(
      { userId, email, name: parsed.data.name.trim() },
      { status: 201 },
    );
    response.cookies.set(sessionCookieOptions(token));

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
