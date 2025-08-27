// app/api/customers/under-review/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth"; // path to your Better Auth server instance
import { headers } from "next/headers";
import { ApplicationStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    // 🔑 Get session user via Better Auth
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Fetch only "UNDER_REVIEW" applications assigned to this user
    const customers = await prisma.customer.findMany({
      where: {
        applicationStatus: ApplicationStatus.SUPERVISED,
        creditAnalystID: userId,
      },
    });

    if (customers.length === 0) {
      return NextResponse.json(
        { error: "No applications found for this analyst." },
        { status: 404 }
      );
    }

    return NextResponse.json(customers, { status: 200 });
  } catch (err: any) {
    console.error("Error fetching under-review applications:", err);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
