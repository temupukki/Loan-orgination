// app/api/decisions/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user.id;

  try {
    const body = await request.json();
    const { applicationReferenceNumber, decision, decisionReason } = body;

    // Validate required fields
    if (
      !applicationReferenceNumber ||
      !decision ||
      !decisionReason ||
      !userId
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create new decision
    const decisionRecord = await prisma.membersDecision.create({
      data: {
        userId,
        applicationReferenceNumber,
        decision,
        decisionReason,
        decisionDate: new Date(),
      },
    });

    return NextResponse.json(
      { message: "Decision recorded successfully", decision: decisionRecord },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Error creating/updating decision record:", err);

    if (err.code === "P2002") {
      const target = err.meta?.target;
      return NextResponse.json(
        { error: `A decision with this ${target} already exists` },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create decision record" },
      { status: 500 }
    );
  }
}
