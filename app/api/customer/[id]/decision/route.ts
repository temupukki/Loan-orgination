// app/api/customer/[id]/take/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();
    const { decision } = body;

    // Validate required fields
    if (!decision) {
      return NextResponse.json(
        { error: "Decision is required" },
        { status: 400 }
      );
    }

    // Validate decision value
    const validDecisions = ["APPROVED", "COMMITTE_REVERSED", "REJECTED"];
    if (!validDecisions.includes(decision)) {
      return NextResponse.json(
        { error: "Invalid decision value" },
        { status: 400 }
      );
    }

    // Atomically update the customer's status only if it is COMMITTEE_REVIEW
    const result = await prisma.customer.updateMany({
      where: {
        id: id,
        applicationStatus: 'COMMITTE_REVIEW',
      },
      data: {
        applicationStatus: decision, // Use the decision from frontend
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Application already taken or not in committee review" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Application status updated successfully" }
    );
  } catch (err: any) {
    console.error("Error updating application status:", err);
    return NextResponse.json(
      { error: "Failed to update application status" },
      { status: 500 }
    );
  }
}