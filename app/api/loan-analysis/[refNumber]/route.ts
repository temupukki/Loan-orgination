import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Make sure this is your Prisma client

export async function GET(req: Request, context: { params: Promise<{ refNumber: string }> }) {
  try {
    // Await params first
    const params = await context.params;
    const refNumber = params.refNumber;

    if (!refNumber) {
      return NextResponse.json(
        { error: "Application reference number is required" },
        { status: 400 }
      );
    }

    // Fetch loan analysis from Prisma
    const analysis = await prisma.loanAnalysis.findUnique({
      where: { applicationReferenceNumber: refNumber },
    });

    if (!analysis) {
      return NextResponse.json(
        { error: "Loan analysis not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(analysis, { status: 200 });
  } catch (err: any) {
    console.error("Error fetching loan analysis:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
