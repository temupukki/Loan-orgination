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
  const responsibleUnitName = session?.user.name;
  const responsibleUnitEmail = session?.user.email;
  
  // Safe handling of image field with null check
  let responsibleUnitPhone = "";
  const image = session?.user.image;
  
  if (image) {
    try {
      const parts = image.split("-");
      responsibleUnitPhone = parts[1] || "";
    } catch (error) {
      console.error("Error parsing image field:", error);
      responsibleUnitPhone = "";
    }
  }

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
        responsibleUnitName,
        responsibleUnitEmail,
        responsibleUnitPhone,
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

    return NextResponse.json(
      { error: "Failed to create decision record" },
      { status: 500 }
    );
  }
}