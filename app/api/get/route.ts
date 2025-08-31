import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ApplicationStatus } from "@prisma/client"; // import your enum

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");

    if (!statusParam) {
      return NextResponse.json(
        { error: "Missing status parameter" },
        { status: 400 }
      );
    }

    // Map string to enum
    let status: ApplicationStatus;
    switch (statusParam.toUpperCase()) {
      case "PENDING":
        status = ApplicationStatus.PENDING;
        break;
      case "UNDER_REVIEW":
        status = ApplicationStatus.UNDER_REVIEW;
        break;
      case "ANALYSIS_COMPLETED":
        status = ApplicationStatus.ANALYSIS_COMPLETED;
        break;
      case "SUPERVISED":
        status = ApplicationStatus.SUPERVISED;
        break;
      case "COMMITTE_REVIEW":
        status = ApplicationStatus.COMMITTE_REVIEW;
        break;
      case "RM_RECCOMENDATION":
        status = ApplicationStatus.RM_RECCOMENDATION;
        break;
      case "MEMBER_REVIEW":
        status = ApplicationStatus.MEMBER_REVIEW;
        break;
      case "ANALYSIS_COMPLETED":
        status = ApplicationStatus.ANALYSIS_COMPLETED;
        break;
      case "APPROVED":
        status = ApplicationStatus.APPROVED;
        break;
      default:
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const customers = await prisma.customer.findMany({
      where: { applicationStatus: status },
    });

    if (customers.length === 0) {
      return NextResponse.json(
        { error: "No customers found" },
        { status: 404 }
      );
    }

    return NextResponse.json(customers);
  } catch (err: any) {
    console.error("Error fetching customers:", err);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}
