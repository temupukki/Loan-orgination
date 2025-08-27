// app/api/decision/[applicationReferenceNumber]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { applicationReferenceNumber: string } }
) {
  try {
    const { applicationReferenceNumber } = params;

    const decision = await prisma.decision.findUnique({
      where: { applicationReferenceNumber },
    });

    if (!decision) {
      return NextResponse.json(
        { error: "Decision not found" },
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
