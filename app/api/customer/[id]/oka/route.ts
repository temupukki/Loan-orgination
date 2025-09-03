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
    const { newStatus, supervisorID } = body;

    if (!newStatus || !supervisorID) {
      return NextResponse.json(
        { error: "Both newStatus and supervisorID are required." },
        { status: 400 }
      );
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        applicationStatus: "SUPERVISOR_REVIEWING",
        supervisorID: supervisorID,
      },
    });

    return NextResponse.json(updatedCustomer, { status: 200 });
  } catch (err: any) {
    console.error("Error updating application:", err);

    if (err.code === "P2025") {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}