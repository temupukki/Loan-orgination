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
  const image:any= session?.user.image;
  const parts = image.split("-");
  const responsibleUnitPhone=parts[1];
  const responsibleUnitEmail=session?.user.email



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
