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
        budget: 1,
        members: 1,
        expenses: 1,
      })
      .sort({ updatedAt: -1 })
      .toArray();

    const result = trips.map((t) => {
      const members = Array.isArray(t.members) ? t.members : [];
      const me = members.find(
        (m: { userId?: string }) => m.userId === session.userId,
      );
      const myMemberId = me?.memberId;

      const expenses = Array.isArray(t.expenses) ? t.expenses : [];
      const groupExpenses = expenses.filter(
        (e: { expenseType?: string }) => e.expenseType !== "personal",
      );
      const totalSpent = groupExpenses.reduce(
        (sum: number, e: { amount: number }) => sum + e.amount,
        0,
      );
      const mySpent = expenses
        .filter((e: { paidBy: string }) => e.paidBy === myMemberId)
        .reduce((sum: number, e: { amount: number }) => sum + e.amount, 0);

      return {
        passcode: t.passcode,
        tripName: t.tripName,
        startDate: t.startDate,
        endDate: t.endDate,
        currency: t.currency,
        budget: t.budget ?? 0,
        memberCount: members.length,
        totalSpent,
        mySpent,
      };
    });

    return NextResponse.json({ trips: result });
  } catch (error) {
    return handleApiError(error);
  }
}
