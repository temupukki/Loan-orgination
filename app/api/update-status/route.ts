import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { customerId, status } = await req.json();

    if (!customerId || !status) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id: customerId },
      data: { applicationStatus: status },
    });

    return NextResponse.json(updatedCustomer);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
