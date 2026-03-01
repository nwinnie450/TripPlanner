import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const collection = await getCollection("trips");
    const trips = await collection
      .find({ "members.userId": session.userId })
      .project({
        passcode: 1,
        tripName: 1,
        startDate: 1,
        endDate: 1,
        currency: 1,
        members: 1,
      })
      .sort({ updatedAt: -1 })
      .toArray();

    const result = trips.map((t) => ({
      passcode: t.passcode,
      tripName: t.tripName,
      startDate: t.startDate,
      endDate: t.endDate,
      currency: t.currency,
      memberCount: Array.isArray(t.members) ? t.members.length : 0,
    }));

    return NextResponse.json({ trips: result });
  } catch (error) {
    return handleApiError(error);
  }
}
