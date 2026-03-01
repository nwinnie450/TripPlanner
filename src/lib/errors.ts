import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiError";
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      status: this.status,
    };
  }
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { code: error.code, message: error.message },
      { status: error.status }
    );
  }

  const isMongoError =
    error instanceof Error &&
    (error.name === "MongoServerError" ||
      error.name === "MongoNetworkError" ||
      error.message.includes("MongoDB"));

  if (isMongoError) {
    console.error("MongoDB error:", error);
    return NextResponse.json(
      { code: "DATABASE_ERROR", message: "Database error" },
      { status: 502 }
    );
  }

  console.error("Unhandled API error:", error);
  return NextResponse.json(
    { code: "INTERNAL_ERROR", message: "An unexpected error occurred" },
    { status: 500 }
  );
}
