// app/api/customers/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let whereClause = {};
    if (status && status !== 'all') {
      whereClause = {
        applicationStatus: status
      };
    }

    const customers = await prisma.customer.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
     // If you want to include decision data
      
    });

    return NextResponse.json(customers);
  } catch (err: any) {
    console.error("Error fetching customers:", err);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}