// app/api/decision/[applicationReferenceNumber]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ applicationReferenceNumber: string }> }
) {
  try {
    const resolvedParams = await params;
    const { applicationReferenceNumber } = resolvedParams;

    // Get current user from session
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const userId = session?.user.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch ALL decisions for the given application reference number
    const decisions = await prisma.membersDecision.findMany({
      where: {
        applicationReferenceNumber,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            // include any other user fields you need
          }
        }
      },
      orderBy: {
        createdAt: 'desc' // Optional: order by creation date
      }
    });

    if (!decisions || decisions.length === 0) {
      return NextResponse.json(
        { error: "No decisions found for this application" },
        { status: 404 }
      );
    }

    return NextResponse.json(decisions, { status: 200 });
  } catch (err: any) {
    console.error("Error fetching decisions:", err);
    return NextResponse.json(
      { error: "Failed to fetch decisions" },
      { status: 500 }
    );
  }
}