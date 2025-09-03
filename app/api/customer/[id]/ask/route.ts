
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { newStatus, creditAnalystComment } = body;

    if (!newStatus || !creditAnalystComment) {
      return NextResponse.json(
        { error: "Both newStatus and creditAnalystComment are required." },
        { status: 400 }
      );
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        applicationStatus: "RM_RECCOMENDATION",
        creditAnalystComment: creditAnalystComment,
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