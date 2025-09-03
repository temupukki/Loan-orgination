// app/api/decision/[applicationReferenceNumber]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ applicationReferenceNumber: string }> }
) {
  try {
    const resolvedParams = await params;
    const { applicationReferenceNumber } = resolvedParams;

    // Get current user from session
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const userId = session?.user.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the decision made by this user for the given application
    const decision = await prisma.membersDecision.findFirst({
      where: {
        applicationReferenceNumber,
        userId, // ✅ ensures only the current user's decision is fetched
      },
    });

    if (!decision) {
      return NextResponse.json(
        { error: "Decision not found for this user" },
        { status: 404 }
      );
    }

    return NextResponse.json(decision, { status: 200 });
  } catch (err: any) {
    console.error("Error fetching decision:", err);
    return NextResponse.json(
      { error: "Failed to fetch decision" },
      { status: 500 }
    );
  }
}