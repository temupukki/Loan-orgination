import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ref = searchParams.get('ref');
    const status = searchParams.get('status');

    // If reference number is provided, search for specific application
    if (ref) {
      const customer = await prisma.customer.findUnique({
        where: {
          applicationReferenceNumber: ref
        }
      });

      if (!customer) {
        return NextResponse.json(
          { error: "Application not found with this reference number" },
          { status: 404 }
        );
      }

      return NextResponse.json(customer);
    }

    // If no reference number, return all customers (with optional status filter)
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
      }
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