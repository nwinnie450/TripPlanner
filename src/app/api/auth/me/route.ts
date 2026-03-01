import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/auth";

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
