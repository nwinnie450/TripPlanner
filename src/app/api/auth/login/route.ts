import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { loginSchema } from "@/lib/validation";
import { verifyPassword, createSession, sessionCookieOptions } from "@/lib/auth";
import { ApiError, handleApiError } from "@/lib/errors";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        "VALIDATION_ERROR",
        parsed.error.issues.map((i) => i.message).join(", "),
        400,
      );
    }

    const email = parsed.data.email.toLowerCase().trim();
    const collection = await getCollection("users");

    const user = await collection.findOne({ email });
    if (!user) {
      throw new ApiError(
        "INVALID_CREDENTIALS",
        "Invalid email or password",
        401,
      );
    }

    const valid = await verifyPassword(parsed.data.password, user.passwordHash as string);
    if (!valid) {
      throw new ApiError(
        "INVALID_CREDENTIALS",
        "Invalid email or password",
        401,
      );
    }

    const token = await createSession(user.userId as string);
    const response = NextResponse.json({
      userId: user.userId,
      email: user.email,
      name: user.name,
    });
    response.cookies.set(sessionCookieOptions(token));

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
