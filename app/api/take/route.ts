// app/api/customer/[id]/take/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Atomically update the customer's status only if it is PENDING
    const result = await prisma.customer.updateMany({
      where: {
        id: id,
        applicationStatus: 'PENDING',
      },
      data: {
        applicationStatus: 'UNDER_REVIEW', // The new status is hardcoded here
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Application already taken or not pending" }, { status: 409 });
    }

    return NextResponse.json({ message: "Application status updated successfully" });
  } catch (err: any) {
    console.error("Error updating application status:", err);
    return NextResponse.json({ error: "Failed to update application status" }, { status: 500 });
  }
}