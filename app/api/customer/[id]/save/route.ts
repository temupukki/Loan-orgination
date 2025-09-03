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

    // Use prisma.customer.update to target a single record by its unique ID
    const updatedCustomer = await prisma.customer.update({
      where: {
        id: id,
      },
      data: {
        applicationStatus: 'ANALYSIS_COMPLETED', // Update the status to 'ANALYSIS_COMPLETED'
      },
    });

    // You can remove the check for result.count as update will throw an error if not found
    return NextResponse.json(updatedCustomer);
  } catch (err: any) {
    console.error("Error updating application status:", err);
    // Return a more specific error if the record wasn't found
    if (err.code === 'P2025') {
        return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update application status" }, { status: 500 });
  }
}