
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
   
    const responsibleUnitName = session?.user.name;
    const image:any= session?.user.image;
    const parts = image.split("-");
    const responsibleUnitPhone=parts[1];
    const responsibleUnitEmail=session?.user.email
    
  try {
    const body = await request.json();
    const { customerId, applicationReferenceNumber, decision, decisionReason, committeeMember } = body;

    // Validate required fields
    if (!customerId || !applicationReferenceNumber || !decision || !committeeMember) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if a decision already exists for this application
    const existingDecision = await prisma.decision.findFirst({
      where: {
        applicationReferenceNumber: applicationReferenceNumber,
      },
    });

    if (existingDecision) {
      // Update the existing decision instead of creating a new one
      const decisionRecord = await prisma.decision.update({
        where: {
          id: existingDecision.id,
        },
        data: {
        decision,
        decisionReason,
       
        
         
          decisionDate: new Date(),
        },
      });

      return NextResponse.json(
        { message: "Decision updated successfully", decision: decisionRecord },
        { status: 200 }
      );
    }

    // Create a new decision record if none exists
    const decisionRecord = await prisma.decision.create({
      data: {
        customerId,
        applicationReferenceNumber,
        decision,
        decisionReason,
        responsibleUnitName,
        responsibleUnitEmail,
        responsibleUnitPhone,
       
        decisionDate: new Date(),
      },
    });

    return NextResponse.json(
      { message: "Decision recorded successfully", decision: decisionRecord },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Error creating/updating decision record:", err);
    
    // Handle unique constraint violation specifically
    if (err.code === 'P2002') {
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